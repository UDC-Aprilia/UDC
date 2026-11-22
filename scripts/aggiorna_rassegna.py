#!/usr/bin/env python3
"""Archivio persistente di segnalazioni RSS, senza riprodurre articoli integrali.
Esecuzione programmata in GitHub Actions. Non garantisce copertura completa del web.
"""
import hashlib
import json
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlencode, urlsplit
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / 'data/stampa.json'
BLOCK = ROOT / 'data/stampa_esclusioni.json'
NEWS = 'https://news.google.com/rss/search?'
QUERIES = (
    '"Pietro Fazio" "Aprilia"', '"Pietro Fazio" "UDC"',
    '"UDC Aprilia"', '"coordinatore UDC" "Aprilia"',
    '"Fazio" "UDC" "Aprilia"',
    'site:latinanews.eu "Fazio" "Aprilia"',
    'site:studio93.it "UDC" "Aprilia"',
    'site:aprilianews.it "UDC" "Aprilia"',
)
PATTERN = re.compile(r'\bpietro\s+fazio\b|\budc\b.{0,100}\baprilia\b|\baprilia\b.{0,100}\budc\b|\bfazio\b.{0,100}\baprilia\b|\baprilia\b.{0,100}\bfazio\b', re.I)
EXCLUDE = re.compile(r'\b(motogp|racing|bezzecchi|rsv4)\b', re.I)

def normalize(s):
    return re.sub(r'[^\w]+', ' ', str(s).casefold()).strip()

def clean_url(s):
    return str(s or '').split('?', 1)[0].rstrip('/')

def extract(xml):
    root = ET.fromstring(xml)
    for item in root.findall('./channel/item'):
        title = (item.findtext('title') or '').strip()
        link = (item.findtext('link') or '').strip()
        source = item.find('source')
        source_name = (source.text or '').strip() if source is not None else ''
        if source_name and title.endswith(' - ' + source_name):
            title = title[:-(len(source_name) + 3)].strip()
        description = re.sub(r'<[^>]+>', ' ', item.findtext('description') or '')
        if not PATTERN.search(title + ' ' + description) or EXCLUDE.search(title):
            continue
        if urlsplit(link).scheme != 'https':
            continue
        try:
            date = parsedate_to_datetime(item.findtext('pubDate') or '')
            if date.tzinfo is None:
                date = date.replace(tzinfo=timezone.utc)
            day = date.astimezone(timezone.utc).date().isoformat()
            if day > datetime.now(timezone.utc).date().isoformat():
                continue
        except (ValueError, TypeError, OverflowError):
            continue
        yield {
            'id': 'rassegna-auto-' + hashlib.sha256((normalize(title) + normalize(source_name) + day).encode()).hexdigest()[:16],
            'data': day, 'titolo': title[:210],
            'testo': 'Segnalazione automatica da feed pubblico. Verificare il contenuto e la firma sulla testata.',
            'fonte': source_name[:100] or 'Fonte esterna', 'link': link,
            'tipo_link': 'aggregatore' if 'news.google.com' in (urlsplit(link).hostname or '') else 'diretto',
            'origine': 'ricerca_rss', 'argomento': 'UDC Aprilia / Pietro Fazio',
        }

def update(fetch=None):
    if fetch is None:
        from aggiorna_notizie import scarica
        fetch = scarica
    existing = json.loads(FILE.read_text(encoding='utf-8'))
    exclusions = json.loads(BLOCK.read_text(encoding='utf-8')) if BLOCK.exists() else {'ids': [], 'urls': [], 'titles': []}
    banned_ids = set(exclusions.get('ids', []))
    banned_urls = {clean_url(x) for x in exclusions.get('urls', [])}
    banned_titles = {normalize(x) for x in exclusions.get('titles', [])}
    titles = {(normalize(i.get('titolo', '')), normalize(i.get('fonte', '')), i.get('data', '')) for i in existing}
    links = {clean_url(i.get('link', '')) for i in existing}
    added = 0
    errors = []
    for query in QUERIES:
        url = NEWS + urlencode({'q': query, 'hl': 'it', 'gl': 'IT', 'ceid': 'IT:it'})
        try:
            for item in extract(fetch(url)):
                t = normalize(item['titolo'])
                u = clean_url(item['link'])
                key = (t, normalize(item.get('fonte', '')), item.get('data', ''))
                if key in titles or u in links or t in banned_titles or u in banned_urls or item['id'] in banned_ids:
                    continue
                existing.append(item)
                titles.add(key)
                links.add(u)
                added += 1
        except (OSError, ValueError, ET.ParseError) as exc:
            errors.append(f'{query}: {exc}')
    # Suggerimenti di corrispondenza ai PDF, sempre da verificare.
    from recupero_storico_stampa import DOCS, pdf_matches
    docs = json.loads(DOCS.read_text(encoding='utf-8'))
    linked = 0
    for item in existing:
        if not item.get('pdf_collegati'):
            matches = pdf_matches(item, docs)
            if matches:
                item['pdf_collegati'] = matches
                linked += 1
    if added or linked:
        existing.sort(key=lambda x: x.get('data', ''), reverse=True)
        FILE.write_text(json.dumps(existing, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return added, errors

if __name__ == '__main__':
    n, errors = update()
    print(f'Rassegna: {n} nuovi riferimenti; {len(errors)} ricerche non riuscite.')
    for error in errors:
        print('Fonte:', error)
