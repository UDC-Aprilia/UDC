#!/usr/bin/env python3
"""Recupero storico incrementale dai feed Google News, per intervalli mensili.
Non garantisce completezza degli indici esterni. Le associazioni PDF sono suggerimenti,
non prove di ripresa del comunicato. Usa --dry-run per un'anteprima senza scrittura.
"""
import argparse
import calendar
import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
sys.path.insert(0, str(Path(__file__).resolve().parent))
import aggiorna_rassegna as base
from aggiorna_notizie import scarica

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'data/documenti.json'
STOP = {'udc','aprilia','comunicato','stampa','della','delle','degli','dello','dopo','sulla','sulle','nella','nelle','per','con','alla','alle','agli','che','sono','un','una','il','lo','la','gli','dei','del','dal','nel','ora','piu','fazio','pietro','cittadini','citta'}

def words(text):
    return {w for w in re.findall(r'[a-z0-9]{4,}',base.normalize(text)) if w not in STOP}

def pdf_matches(item, docs):
    title_words = words(item.get('titolo',''))
    if len(title_words)<2: return []
    candidates=[]
    for d in docs:
        if not d.get('pubblica',True) or not d.get('file'):continue
        doc_words=words(d.get('titolo',''))
        common=title_words & doc_words
        # Serve un nucleo tematico distintivo; evitare collegamenti generici.
        if len(common)<2 or len(common)/max(1,min(len(title_words),len(doc_words)))<0.48:continue
        try: delta=(date.fromisoformat(item['data'])-date.fromisoformat(d['data'])).days
        except (ValueError,KeyError):continue
        if not (-2<=delta<=120):continue
        score=round(len(common)/max(1,min(len(title_words),len(doc_words))),2)
        candidates.append((score,-abs(delta),d))
    candidates.sort(key=lambda x:(x[0],x[1]),reverse=True)
    return [{'file':c['file'],'titolo':c['titolo'],'data':c['data'],'stato':'corrispondenza_da_verificare'} for _,__,c in candidates[:2]]

def months(start,end):
    year,month=start.year,start.month
    while (year,month)<=(end.year,end.month):
        a=max(start,date(year,month,1));b=min(end,date(year,month,calendar.monthrange(year,month)[1]))
        yield a,b
        month+=1
        if month>12:year,month=year+1,1

def run(start,end,dry_run=False,fetch=scarica):
    existing=json.loads(base.FILE.read_text(encoding='utf-8'))
    docs=json.loads(DOCS.read_text(encoding='utf-8'))
    exclusions=json.loads(base.BLOCK.read_text(encoding='utf-8')) if base.BLOCK.exists() else {}
    banned_ids=set(exclusions.get('ids',[]));banned_urls={base.clean_url(x) for x in exclusions.get('urls',[])}
    banned_titles={base.normalize(x) for x in exclusions.get('titles',[])}
    # Una testata può riprendere lo stesso titolo: non deduplicare per solo titolo.
    seen={(base.normalize(i.get('titolo','')),base.normalize(i.get('fonte','')),i.get('data','')) for i in existing}
    links={base.clean_url(i.get('link','')) for i in existing}
    new=[];errors=[];requests=0
    queries=['"UDC Aprilia"','"Pietro Fazio" "Aprilia"','"UDC" "Aprilia"']
    for a,b in months(start,end):
        for q in queries:
            query=f'{q} after:{(a.fromordinal(a.toordinal()-1)).isoformat()} before:{(b.fromordinal(b.toordinal()+1)).isoformat()}'
            url=base.NEWS+urlencode({'q':query,'hl':'it','gl':'IT','ceid':'IT:it'})
            requests+=1
            try:
                for item in base.extract(fetch(url)):
                    if not a.isoformat()<=item['data']<=b.isoformat():continue
                    key=(base.normalize(item['titolo']),base.normalize(item['fonte']),item['data'])
                    link=base.clean_url(item['link'])
                    if key in seen or link in links or item['id'] in banned_ids or link in banned_urls or base.normalize(item['titolo']) in banned_titles:continue
                    item['pdf_collegati']=pdf_matches(item,docs)
                    item['origine']='recupero_storico_rss'
                    new.append(item);seen.add(key);links.add(link)
            except Exception as exc:errors.append(f'{query}: {exc}')
    # Associa anche le schede esistenti, senza sovrascrivere collegamenti manuali.
    changed=0
    for item in existing:
        if item.get('pdf_collegati'):continue
        matches=pdf_matches(item,docs)
        if matches:item['pdf_collegati']=matches;changed+=1
    if not dry_run and (new or changed):
        existing.extend(new)
        existing.sort(key=lambda x:(x.get('data',''),x.get('titolo','')),reverse=True)
        base.FILE.write_text(json.dumps(existing,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Interrogazioni: {requests}; nuovi articoli: {len(new)}; schede esistenti con possibili PDF: {changed}; errori: {len(errors)}; simulazione: {dry_run}')
    for err in errors:print('ATTENZIONE:',err)
    return len(new),errors

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--dal',default='2025-05-01')
    p.add_argument('--al',default=date.today().isoformat())
    p.add_argument('--dry-run',action='store_true')
    args=p.parse_args()
    run(date.fromisoformat(args.dal),date.fromisoformat(args.al),args.dry_run)
