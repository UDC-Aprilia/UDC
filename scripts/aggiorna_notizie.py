#!/usr/bin/env python3
"""Aggiorna il catalogo di link da RSS selezionati senza ripubblicare articoli.

Le fonti e le ricerche sono configurate in data/fonti-notizie.json.
Le voci Google News sono indicate come link intermediari, non link diretti.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / 'data' / 'fonti-notizie.json'
OUT = ROOT / 'data' / 'web-news.json'
BLOCK = re.compile(r'\b(?:motogp|motocicl\w*|aprilia racing|rs\s*660|bezzecchi|piaggio|rsv4|superbike)\b', re.I)
POLITICAL = re.compile(r'\b(?:udc|unione di centro|lorenzo cesa|antonio de poli|politic\w*|parlament\w*|governo|senat\w*|camera dei deputati|minister\w*|regione lazio|consiglio regionale|giunta regionale|elezion\w*|comune di aprilia|sindac\w*|consiglio comunale)\b', re.I)
MAX_BYTES = 2_000_000


def https_url(value):
    try:
        parsed = urllib.parse.urlsplit(value.strip())
        return value.strip() if parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password else None
    except (ValueError, AttributeError):
        return None


def normalize_title(value):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', value or '')).strip()[:190]


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'UDCApriliaFeed/2.0 (https://udc-aprilia.it; RSS metadata)'})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read(MAX_BYTES + 1)[:MAX_BYTES]


def text_of(item, name):
    node = item.find(name)
    return ''.join(node.itertext()).strip() if node is not None else ''


def parse_date(value):
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value)
    except (TypeError, ValueError, IndexError):
        try:
            parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        except (ValueError, TypeError):
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def source_title(item):
    node = item.find('source')
    return ''.join(node.itertext()).strip() if node is not None else ''


def parse_feed(data, config, now):
    root = ET.fromstring(data)
    channel_items = root.findall('./channel/item')
    atom = '{http://www.w3.org/2005/Atom}'
    entries = channel_items or root.findall(f'./{atom}entry')
    cutoff = now - timedelta(days=int(config.get('max_age_days', 45)))
    output = []
    for item in entries:
        if item.tag == f'{atom}entry':
            title = text_of(item, f'{atom}title')
            link = next((node.get('href', '') for node in item.findall(f'{atom}link') if node.get('rel', 'alternate') == 'alternate'), '')
            dt = text_of(item, f'{atom}published') or text_of(item, f'{atom}updated')
        else:
            title = text_of(item, 'title')
            link = text_of(item, 'link')
            dt = text_of(item, 'pubDate') or text_of(item, '{http://purl.org/dc/elements/1.1/}date')
        title = normalize_title(title)
        link = https_url(link)
        date = parse_date(dt)
        if not title or not link or not date or not cutoff <= date <= now + timedelta(days=1):
            continue
        if BLOCK.search(title):
            continue
        # Per ricerche generiche evita contenuti che non riguardano la politica.
        if config.get('political_only') and not POLITICAL.search(title):
            continue
        if config.get('required_pattern') and not re.search(config['required_pattern'], title, re.I):
            continue
        # Le ricerche sul Comune devono indicare la provenienza istituzionale.
        # Google News fornisce URL intermedi: non fingere un link diretto.
        if config.get('official_domain'):
            official = config['official_domain'].lower()
            source_label = source_title(item).lower()
            source_node = item.find('source')
            source_url = https_url(source_node.get('url', '')) if source_node is not None else None
            source_host = urllib.parse.urlsplit(source_url).hostname.lower() if source_url else ''
            official_host = official.removeprefix('www.')
            if not (source_host == official_host or source_host.endswith('.' + official_host)):
                continue
        source = source_title(item) or config['name']
        if config.get('kind') == 'google_news' and title.endswith(' - ' + source):
            title = title[:-(len(source) + 3)].strip()
        output.append({
            'title': title, 'date': date.date().isoformat(), 'source': source[:90],
            'url': link, 'category': config['category'],
            'priority': config['priority'], 'via': 'Google News' if config.get('kind') == 'google_news' else 'diretta'
        })
    return output


def feed_url(item):
    if item.get('kind') == 'google_news':
        return 'https://news.google.com/rss/search?' + urllib.parse.urlencode({
            'q': item['query'], 'hl': 'it', 'gl': 'IT', 'ceid': 'IT:it'
        })
    return item['url']


def main():
    config = json.loads(CONFIG.read_text(encoding='utf-8'))
    existing = {'updated_at': '', 'items': []}
    try:
        existing = json.loads(OUT.read_text(encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        pass
    now = datetime.now(timezone.utc)
    items, failures, succeeded = [], [], 0
    for source in config['sources']:
        if not source.get('enabled', True):
            continue
        try:
            url = feed_url(source)
            if not https_url(url):
                raise ValueError('URL feed non HTTPS')
            found = parse_feed(fetch(url), source, now)
            items.extend(found)
            succeeded += 1
            print(f"{source['name']}: {len(found)} voci compatibili")
        except (Exception) as error:
            failures.append(f"{source['name']}: {type(error).__name__}: {error}")
    if not succeeded:
        print('Nessun feed raggiunto; conservato catalogo precedente.', *failures, sep='\n', file=sys.stderr)
        return 1
    # Recupera i contenuti precedenti solo per le fonti non raggiunte; scarta comunque le voci datate.
    old = existing.get('items', []) if isinstance(existing, dict) else []
    if failures and isinstance(old, list):
        old_cutoff = (now - timedelta(days=60)).date().isoformat()
        items.extend(x for x in old if isinstance(x, dict) and x.get('date', '') >= old_cutoff and https_url(x.get('url', '')))
    seen_urls, seen_titles, unique = set(), set(), []
    for item in sorted(items, key=lambda x: (int(x.get('priority', 0)), x['date']), reverse=True):
        key = re.sub(r'[^\w]+', '', item['title'].casefold())
        url_key = item['url'].split('?')[0].rstrip('/')
        if key in seen_titles or url_key in seen_urls:
            continue
        seen_titles.add(key)
        seen_urls.add(url_key)
        unique.append(item)
    # Quote per categoria: l'eccesso di notizie nazionali non deve oscurare il territorio.
    quotas = {'UDC Aprilia': 25, 'Comune di Aprilia': 25, 'Europa e NATO': 20, 'UDC nazionale': 35, 'UDC Regione Lazio': 20}
    picked, counts = [], {}
    for item in unique:
        category = item.get('category', '')
        if category in ('Lorenzo Cesa', 'Antonio De Poli', 'UDC e dirigenti nazionali'):
            category = 'UDC nazionale'
            item['category'] = category
        counts[category] = counts.get(category, 0) + 1
        if counts[category] <= quotas.get(category, 18):
            picked.append(item)
    payload = {'updated_at': now.isoformat(timespec='seconds'), 'items': picked[:120]}
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"Catalogo aggiornato: {len(payload['items'])} articoli. Errori: {len(failures)}")
    for error in failures:
        print(error, file=sys.stderr)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
