#!/usr/bin/env python3
"""Integra la rassegna UDC Aprilia con titoli RSS pertinenti e verificabili.

Non attribuisce automaticamente la firma a Carmen Porcelli: il feed non prova
l'autore. Non cancella le schede editoriali esistenti; i nuovi risultati restano
nell'archivio, anche dopo 90 giorni. Nessuna copia del testo degli articoli.
"""
import json
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlencode, urlsplit
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / 'data/stampa.json'
NEWS = 'https://news.google.com/rss/search?'
DOMAINS = ('latinanews.eu', 'studio93.it', 'latinaoggi.eu', 'latinatu.it', 'ilcaffe.tv', 'sferamagazine.it', 'udc-italia.it')
QUERIES = (
    '"Pietro Fazio" "Aprilia"',
    '"UDC Aprilia"',
    '"Fazio" "UDC" "Aprilia"',
    'site:latinanews.eu "Fazio" "Aprilia"',
    'site:latinanews.eu "UDC" "Aprilia"',
    'site:latinanews.eu "Carmen Porcelli" "Fazio"',
    'site:latinanews.eu "Fazio" "sanità"',
)
PATTERN = re.compile(r'\bpietro\s+fazio\b|\budc\b.{0,65}\baprilia\b|\baprilia\b.{0,65}\budc\b|\bfazio\b.{0,90}\baprilia\b|\baprilia\b.{0,90}\bfazio\b', re.I)
EXCLUDE = re.compile(r'\b(motogp|racing|bezzecchi|piaggio|rsv4)\b', re.I)


def host_allowed(url):
    host = (urlsplit(url).hostname or '').lower()
    return any(host == d or host.endswith('.' + d) for d in DOMAINS)


def normalize(s):
    return re.sub(r'[^\w]+', ' ', s.casefold()).strip()


def extract(xml):
    root = ET.fromstring(xml)
    for item in root.findall('./channel/item'):
        title = (item.findtext('title') or '').strip()
        link = (item.findtext('link') or '').strip()
        source = item.find('source')
        source_name = (source.text or '').strip() if source is not None else ''
        source_url = source.get('url', '') if source is not None else ''
        if source_name and title.endswith(' - ' + source_name):
            title = title[:-(len(source_name) + 3)].strip()
        if not PATTERN.search(title) or EXCLUDE.search(title):
            continue
        if urlsplit(link).scheme != 'https':
            continue
        google = (urlsplit(link).hostname or '') in ('news.google.com', 'www.news.google.com')
        if not host_allowed(source_url if google else link):
            continue
        try:
            date = parsedate_to_datetime(item.findtext('pubDate') or '')
            if date.tzinfo is None: date = date.replace(tzinfo=timezone.utc)
            day = date.astimezone(timezone.utc).date().isoformat()
            if day > datetime.now(timezone.utc).date().isoformat(): continue
        except (ValueError, TypeError, OverflowError):
            continue
        yield {
            'id': 'rassegna-auto-' + __import__('hashlib').sha256((normalize(title) + day).encode()).hexdigest()[:16],
            'data': day, 'titolo': title[:210],
            'testo': 'Articolo segnalato dalla ricerca delle fonti. Consulta la testata per il testo e la firma.',
            'fonte': source_name[:100] or 'Testata esterna', 'link': link,
            'tipo_link': 'aggregatore' if google else 'diretto', 'origine': 'ricerca_rss'
        }


def update(fetch=None):
    if fetch is None:
        from aggiorna_notizie import scarica
        fetch = scarica
    existing = json.loads(FILE.read_text(encoding='utf-8'))
    titles = {normalize(i.get('titolo', '')) for i in existing}
    links = {i.get('link', '').split('?', 1)[0].rstrip('/') for i in existing}
    added = 0
    errors = []
    for query in QUERIES:
        url = NEWS + urlencode({'q': query, 'hl': 'it', 'gl': 'IT', 'ceid': 'IT:it'})
        try:
            for item in extract(fetch(url)):
                t = normalize(item['titolo'])
                u = item['link'].split('?', 1)[0].rstrip('/')
                if t in titles or u in links: continue
                existing.append(item)
                titles.add(t); links.add(u); added += 1
        except (OSError, ValueError, ET.ParseError) as exc:
            errors.append(f'{query}: {exc}')
    if added:
        existing.sort(key=lambda x: x.get('data', ''), reverse=True)
        FILE.write_text(json.dumps(existing, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return added, errors


if __name__ == '__main__':
    n, problems = update()
    print(f'Rassegna: {n} nuove schede; {len(problems)} ricerche non riuscite.')
    for problem in problems: print('Fonte:', problem)
