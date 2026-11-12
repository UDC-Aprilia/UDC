#!/usr/bin/env python3
"""Feed informativo automatico per sito statico. Solo metadati e link, nessun articolo copiato."""
import json
import re
import ssl
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'web-news.json'
QUERIES = [
    ('udc', '"UDC" "Aprilia" when:90d'),
    ('udc', '"Pietro Fazio" "Aprilia" when:90d'),
    ('local', '"Comune di Aprilia" eventi iniziative when:30d'),
    ('local', '"Aprilia" "Latina" notizie città when:14d'),
]
BLOCK = ('motogp', 'motocicl', 'motori', 'aprilia racing', 'rs 660', 'bezzecchi', 'piaggio', 'rsv4', 'motorbike')
LOCAL = re.compile(r'\baprilia\b|\bapriliani\b|\baprili(a|ano)\b', re.I)
UDC = re.compile(r'\budc\b|unione di centro|pietro fazio', re.I)
MAX_AGE = datetime.now(timezone.utc) - timedelta(days=100)

def fetch(query):
    params = urllib.parse.urlencode({'q':query,'hl':'it','gl':'IT','ceid':'IT:it'})
    req = urllib.request.Request('https://news.google.com/rss/search?'+params, headers={'User-Agent':'UDCAprilia-SiteFeed/1.0 (+https://udc-aprilia.it; metadata only)'})
    with urllib.request.urlopen(req, timeout=18, context=ssl.create_default_context()) as resp:
        return resp.read(2_000_000)

def extract(xml, group):
    root = ET.fromstring(xml)
    items = []
    for row in root.findall('.//channel/item'):
        title = (row.findtext('title') or '').strip()
        url = (row.findtext('link') or '').strip()
        source_node = row.find('source')
        source = (source_node.text or '').strip() if source_node is not None else ''
        if source and title.endswith(' - '+source): title=title[:-(len(source)+3)].strip()
        text = title+' '+source
        if not LOCAL.search(text) or any(k in text.lower() for k in BLOCK): continue
        if group == 'udc' and not UDC.search(text): continue
        if group == 'local' and UDC.search(text): group_actual='udc'
        else: group_actual=group
        if not url.startswith('https://'): continue
        try: date = parsedate_to_datetime(row.findtext('pubDate') or '').astimezone(timezone.utc)
        except (TypeError,ValueError,OverflowError): continue
        if date < MAX_AGE or date > datetime.now(timezone.utc)+timedelta(days=1):continue
        items.append({'title':title[:210], 'date':date.date().isoformat(), 'source':source[:80] or 'Google News', 'url':url, 'category':'Notizie UDC Aprilia' if group_actual=='udc' else 'Notizie ed eventi di Aprilia','priority':group_actual})
    return items

def main():
    prior = {'items':[], 'updated_at':''}
    if OUT.exists():
        try:prior=json.loads(OUT.read_text(encoding='utf-8'))
        except (ValueError,OSError):pass
    results=[]
    failures=[]
    for group, query in QUERIES:
        try:results.extend(extract(fetch(query),group))
        except Exception as exc:failures.append(f'{query}: {type(exc).__name__}: {exc}')
    # Un outage non svuota il feed. Salvaguardia di continuità editoriale.
    if not results:
        print('Nessun risultato recuperato; mantengo il feed esistente.','; '.join(failures))
        return
    used=set();clean=[]
    for item in sorted(results, key=lambda x:(x['priority']!='udc',x['date']), reverse=False):
        key=re.sub(r'[^\w]+',' ',item['title'].casefold()).strip()
        if key in used: continue
        used.add(key)
        clean.append(item)
    # UDC in cima; altre notizie saranno intercalate dal carosello.
    clean.sort(key=lambda x:(x['priority']!='udc',-int(x['date'].replace('-',''))))
    payload={'updated_at':datetime.now(timezone.utc).isoformat(timespec='seconds'),'items':clean[:60]}
    updated=json.dumps(payload,ensure_ascii=False,indent=2)+'\n'
    if OUT.read_text(encoding='utf-8') != updated:OUT.write_text(updated,encoding='utf-8')
    print('Feed aggiornato:',len(clean[:60]),'notizie. Errori:',failures)

if __name__=='__main__':main()
