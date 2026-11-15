#!/usr/bin/env python3
"""Aggrega titoli RSS da fonti istituzionali / ricerche ristrette a domini pubblici.

Esecuzione: python scripts/aggiorna_notizie.py
Pubblicazione via GitHub Actions. Conserva il feed precedente se la rete fallisce.
Non importa descrizioni o testi completi; ogni notizia rimanda alla fonte.
"""
from __future__ import annotations
import json
import re
import ssl
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'data/web-news.json'
NEWS_URL = 'https://news.google.com/rss/search?'
MAX_AGE_DAYS = 75
MAX_PER_CATEGORY = 22
MAX_RESULTS = 150

# Ricerca per siti ufficiali: non si includono risultati di domini arbitrari.
# La categoria Comune riguarda tutta la città, non solo i comunicati UDC.
CATEGORIE = {
    'aprilia': {'label': 'Città di Aprilia', 'priority': 1, 'queries': [
        'site:comune.aprilia.lt.it/tipi-di-notizia Aprilia when:60d',
        'site:comune.aprilia.lt.it Aprilia avvisi when:60d'],
        'domains': ('comune.aprilia.lt.it',), 'required': r'.'},
    'regione_lazio': {'label': 'Regione Lazio', 'priority': 2, 'queries': [
        'site:regione.lazio.it/notizie when:45d',
        'site:consiglio.regione.lazio.it notizie when:45d'],
        'domains': ('regione.lazio.it', 'consiglio.regione.lazio.it'), 'required': r'.'},
    'italia': {'label': 'Italia · notizie nazionali', 'priority': 3, 'queries': [
        'site:governo.it comunicato when:30d', 'site:ansa.it politica italia when:14d'],
        'domains': ('governo.it', 'ansa.it'), 'required': r'.'},
    'istituzioni': {'label': 'Istituzioni italiane', 'priority': 4, 'queries': [
        'site:camera.it notizie when:45d', 'site:senato.it notizie when:45d'],
        'domains': ('camera.it', 'senato.it'), 'required': r'.'},
    'europa': {'label': 'Europa e Unione europea', 'priority': 5, 'queries': [
        'site:commission.europa.eu/news when:45d',
        'site:europarl.europa.eu/news/it when:45d',
        'site:consilium.europa.eu/it/press/press-releases when:45d'],
        'domains': ('commission.europa.eu', 'europarl.europa.eu', 'consilium.europa.eu'), 'required': r'.'},
    'udc_nazionale': {'label': 'UDC nazionale', 'priority': 6, 'queries': [
        'site:udc-italia.it when:75d', '"UDC" "De Poli" when:30d'],
        'domains': ('udc-italia.it', 'ansa.it'), 'required': r'udc|unione di centro|de poli|cesa'},
    'udc_aprilia': {'label': 'UDC Aprilia', 'priority': 0, 'queries': [
        '"UDC" "Aprilia" when:75d', '"Pietro Fazio" "Aprilia" when:75d'],
        'domains': ('udc-aprilia.it', 'ansa.it', 'latinaoggi.eu', 'ilcaffe.tv', 'udc-italia.it'),
        'required': r'udc.*aprilia|aprilia.*udc|pietro fazio'},
}
ESCLUSIONI = re.compile(r'motogp|motocicl|aprilia racing|rs 660|bezzecchi|piaggio|rsv4', re.I)
# Feed diretto verificato sul sito ufficiale del Parlamento europeo. Il parsing
# supporta anche Atom in caso di modifica futura del formato.
RSS_DIRETTI = [('europa', 'https://www.europarl.europa.eu/rss/doc/press-releases/it.xml', 'Parlamento europeo')]


def scarica(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'UDCApriliaNews/3.0 (+https://udc-aprilia.it/; RSS headlines only)'})
    with urllib.request.urlopen(req, timeout=17, context=ssl.create_default_context()) as response:
        return response.read(2_000_000)


def scarica_feed(query):
    params = urllib.parse.urlencode({'q': query, 'hl': 'it', 'gl': 'IT', 'ceid': 'IT:it'})
    return scarica(NEWS_URL + params)


def host_consentito(url, domains):
    host = (urllib.parse.urlsplit(url).hostname or '').casefold()
    return any(host == d or host.endswith('.' + d) for d in domains)


def normalizza_titolo(title):
    return re.sub(r'[^\w]+', ' ', title.casefold()).strip()


def estrai_notizie(xml, categoria, now=None, source_override=None):
    now = now or datetime.now(timezone.utc)
    config = CATEGORIE[categoria]
    required = re.compile(config['required'], re.I)
    root = ET.fromstring(xml)
    entries = root.findall('./channel/item')
    atom = root.tag.endswith('feed')
    if atom: entries = root.findall('{http://www.w3.org/2005/Atom}entry')
    result = []
    for item in entries:
        if atom:
            ns = '{http://www.w3.org/2005/Atom}'
            title = (item.findtext(ns + 'title') or '').strip()
            link_element = item.find(ns + 'link')
            url = link_element.get('href', '') if link_element is not None else ''
            date_raw = item.findtext(ns + 'published') or item.findtext(ns + 'updated') or ''
            source = source_override or config['label']
            source_url = url
        else:
            title = (item.findtext('title') or '').strip()
            url = (item.findtext('link') or '').strip()
            date_raw = item.findtext('pubDate') or ''
            source_element = item.find('source')
            source = source_override or ((source_element.text or '').strip() if source_element is not None else '')
            source_url = source_element.get('url', '') if source_element is not None else ''
            if source and title.endswith(' - ' + source): title = title[:-(len(source)+3)].strip()
        if not title or not required.search(title + ' ' + source): continue
        if categoria in ('aprilia', 'udc_aprilia') and ESCLUSIONI.search(title): continue
        target = urllib.parse.urlsplit(url)
        if target.scheme != 'https' or not target.hostname: continue
        is_google = target.hostname in ('news.google.com', 'www.news.google.com')
        if is_google:
            # Google News genera link di rinvio. Il nodo <source url> identifica
            # il sito originale e deve appartenere alla whitelist della categoria.
            if not host_consentito(source_url, config['domains']): continue
        elif not host_consentito(url, config['domains']): continue
        try:
            published = parsedate_to_datetime(date_raw) if not atom else datetime.fromisoformat(date_raw.replace('Z', '+00:00'))
            if published.tzinfo is None: published = published.replace(tzinfo=timezone.utc)
            published = published.astimezone(timezone.utc)
        except (ValueError, TypeError, OverflowError): continue
        if not now-timedelta(days=MAX_AGE_DAYS) <= published <= now+timedelta(days=1): continue
        result.append({'title': title[:210], 'date': published.date().isoformat(),
                       'source': source[:100] or config['label'], 'url': url,
                       'category': config['label'], 'priority': categoria})
    return result


def deduplica(items):
    ordered = sorted(items, key=lambda i: (CATEGORIE.get(i.get('priority'), {}).get('priority', 99), -int(i.get('date','0000-00-00').replace('-', '') or 0)))
    urls, titles, result, counts = set(), set(), [], {}
    for item in ordered:
        key = item.get('priority')
        if key not in CATEGORIE or counts.get(key, 0) >= MAX_PER_CATEGORY: continue
        title_key = normalizza_titolo(item['title']); url_key = item['url'].split('?',1)[0].rstrip('/')
        if title_key in titles or url_key in urls: continue
        titles.add(title_key); urls.add(url_key); counts[key] = counts.get(key,0)+1
        result.append(item)
    return sorted(result[:MAX_RESULTS], key=lambda i: i['date'], reverse=True)


def salva_snapshot(payload):
    cataloghi = {}
    for key, filename in {'foto':'foto.json','stampa':'stampa.json','attivita':'attivita.json','documenti':'documenti.json'}.items():
        cataloghi[key] = json.loads((OUTPUT.parent / filename).read_text(encoding='utf-8'))
    cataloghi['webNews'] = payload
    (ROOT / 'js/dati-locali.js').write_text('/* Cataloghi locali generati automaticamente. */\nwindow.UDCLocalData = '
        + json.dumps(cataloghi, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')


def main():
    previous = {'updated_at':'', 'items':[]}
    if OUTPUT.exists():
        try: previous = json.loads(OUTPUT.read_text(encoding='utf-8'))
        except (OSError, ValueError): pass
    results, errors = [], []
    for categoria, url, source in RSS_DIRETTI:
        try: results.extend(estrai_notizie(scarica(url), categoria, source_override=source))
        except (OSError, ValueError, ET.ParseError) as e: errors.append(f'{categoria} RSS: {e}')
    for category, config in CATEGORIE.items():
        for query in config['queries']:
            try: results.extend(estrai_notizie(scarica_feed(query), category))
            except (OSError, ValueError, ET.ParseError) as e: errors.append(f'{category}: {e}')
    today = datetime.now(timezone.utc)
    fresh = (today - timedelta(days=MAX_AGE_DAYS)).date().isoformat()
    found = {i['priority'] for i in results}
    for item in previous.get('items', []):
        if isinstance(item, dict) and item.get('priority') in CATEGORIE and item.get('date', '') >= fresh and item['priority'] not in found:
            results.append(item)
    if not results:
        print('AVVISO: nessun articolo recuperato; dati esistenti invariati.')
        for error in errors: print('ERRORE FONTE:', error)
        return
    payload = {'updated_at': today.isoformat(timespec='seconds'), 'items': deduplica(results)}
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    salva_snapshot(payload)
    print(f'Pubblicate {len(payload["items"])} notizie; {len(errors)} problemi di fonte.')
    for error in errors: print('ERRORE FONTE:', error)


if __name__ == '__main__': main()
