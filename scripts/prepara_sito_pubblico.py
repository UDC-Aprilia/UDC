#!/usr/bin/env python3
"""Build statico esplicito: non copia automaticamente file non approvati."""
from pathlib import Path
import shutil
from valida_pubblicazione import validate, ROOT, is_public_privacy_file

DEST=ROOT/'_site'
ALLOWED_ROOT_EXT={'.html','.xml'}
ALLOWED_ROOT_FILES={'CNAME','robots.txt','favicon.ico','site.webmanifest'}
DATA_FILES={'lettere.json','documenti.json','web-news.json','foto.json','stampa.json','attivita.json'}
DIRECTORIES={'assets':{'.jpg','.jpeg','.png','.webp','.gif','.svg','.ico','.avif'},'css':{'.css'},'js':{'.js'},'data':{'.json'},'lettere':{'.pdf'},'documenti':{'.pdf'}}

def main():
    if validate(ROOT): raise SystemExit('Pubblicazione bloccata: correggere gli errori sopra.')
    if DEST.exists(): shutil.rmtree(DEST)
    DEST.mkdir()
    for p in ROOT.iterdir():
        if p.is_symlink(): raise SystemExit(f'Link simbolico non autorizzato: {p.name}')
        if p.is_file() and (p.suffix.lower() in ALLOWED_ROOT_EXT or p.name in ALLOWED_ROOT_FILES):
            shutil.copy2(p,DEST/p.name)
        elif p.is_dir() and p.name in DIRECTORIES:
            for f in p.rglob('*'):
                if f.is_symlink(): raise SystemExit(f'Link simbolico non autorizzato: {f}')
                if not f.is_file():continue
                if f.suffix.lower() not in DIRECTORIES[p.name] and not (p.name=='documenti' and is_public_privacy_file(f, ROOT)):continue
                if p.name=='data' and f.name not in DATA_FILES:continue
                target=DEST/f.relative_to(ROOT)
                target.parent.mkdir(parents=True,exist_ok=True)
                shutil.copy2(f,target)
    (DEST/'.nojekyll').touch()
    if not (DEST/'index.html').exists():raise SystemExit('index.html mancante')
    print('Sito pubblico costruito in _site/, senza archivi privati o file sorgente.')
if __name__=='__main__':main()
