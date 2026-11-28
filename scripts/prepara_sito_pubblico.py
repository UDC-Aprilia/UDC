#!/usr/bin/env python3
"""Build statico esplicito: non copia automaticamente file non approvati."""
from pathlib import Path
import shutil
import re
from html import escape
from urllib.parse import quote
from impronte import sha256
from valida_pubblicazione import validate, ROOT, is_public_privacy_file

DEST=ROOT/'_site'
ALLOWED_ROOT_EXT={'.html','.xml'}
ALLOWED_ROOT_FILES={'CNAME','robots.txt','favicon.ico','site.webmanifest'}
DATA_FILES={'lettere.json','documenti.json','web-news.json','foto.json','stampa.json','attivita.json'}
DIRECTORIES={'assets':{'.jpg','.jpeg','.png','.webp','.gif','.svg','.ico','.avif'},'css':{'.css'},'js':{'.js'},'data':{'.json'},'lettere':{'.pdf','.docx'},'documenti':{'.pdf','.docx'},'pubblicazioni':{'.pdf','.jpg','.jpeg','.png'}}

def editorial_fallback(publications, destination):
    """HTML essenziale per lettori senza JS, derivato dal medesimo catalogo."""
    program = publications['programma']
    if program:
        url = f"pubblicazioni/programma/{quote(program['file'])}?v={program['versione']}"
        program_html = f'<p>Documento disponibile. <a href="{escape(url)}">Consulta il programma (PDF)</a>.</p>'
    else:
        program_html = '<p>Il programma non è ancora disponibile per la pubblicazione.</p>'
    items = []
    for book in publications['cultura']:
        details = ' · '.join(value for value in (
            book['autori'], book['editore'], book['anno'],
            f"ISBN {book['isbn']}" if book['isbn'] else '',
        ) if value)
        links = []
        for key, label in (('link_editore', 'Scheda editore'), ('link_pubblicazione', 'Pubblicazione o ricerca')):
            if book[key]:
                links.append(f'<a href="{escape(book[key])}">{label}</a>')
        items.append(f"<li><strong>{escape(book['titolo'])}</strong> — {escape(details)} {' · '.join(links)}</li>")
    book_html = '<ul>' + ''.join(items) + '</ul>' if items else '<p>Nessuna pubblicazione disponibile.</p>'
    for page, content in (('programma.html', program_html), ('cultura.html', book_html)):
        path = destination / page
        if not path.exists():
            continue
        text = path.read_text(encoding='utf-8')
        text = re.sub(r'<!-- CMS:START -->.*?<!-- CMS:END -->',
                      lambda _: '<!-- CMS:START -->' + content + '<!-- CMS:END -->',
                      text, count=1, flags=re.S)
        path.write_text(text, encoding='utf-8')
    # Nuovo identificatore a ogni variazione del catalogo, non serve editare le pagine.
    version = sha256(destination / 'js' / 'pubblicazioni.js')[:16]
    for path in destination.glob('*.html'):
        text = path.read_text(encoding='utf-8')
        updated = re.sub(r'js/pubblicazioni\.js(?:\?v=[^"\s]+)?',
                         f'js/pubblicazioni.js?v={version}', text)
        if updated != text:
            path.write_text(updated, encoding='utf-8')


def main():
    from aggiorna_cartelle import generate
    publications = generate(ROOT)
    from aggiorna_cartelle import CATEGORIES
    approved_uploads = {
        ROOT / "pubblicazioni" / category / row["file"]
        for category in CATEGORIES
        for row in publications[category]
    }
    for person in publications['profili']:
        folder = ROOT / 'pubblicazioni' / 'profili' / person['id']
        if person['foto']:
            approved_uploads.add(folder / person['foto'])
        approved_uploads.update(folder / row['file'] for row in person['allegati'])
    if publications['programma']:
        approved_uploads.add(ROOT / 'pubblicazioni' / 'programma' / publications['programma']['file'])
    for book in publications['cultura']:
        if book['copertina']:
            approved_uploads.add(ROOT / 'pubblicazioni' / 'cultura' / book['id'] / book['copertina'])
    if validate(ROOT): raise SystemExit('Pubblicazione bloccata: correggere gli errori sopra.')
    import json
    approved = set()
    for kind in ('documenti','lettere'):
        for row in json.loads((ROOT/'data'/f'{kind}.json').read_text(encoding='utf-8')):
            for key in ('file','file_alternativo','file_risposta'):
                if row.get(key):
                    approved.add(ROOT/kind/str(row['anno'])/row[key])
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
                if p.name in ('documenti','lettere') and f not in approved and not is_public_privacy_file(f, ROOT):continue
                if p.name == "pubblicazioni" and f not in approved_uploads:
                    continue
                target=DEST/f.relative_to(ROOT)
                target.parent.mkdir(parents=True,exist_ok=True)
                shutil.copy2(f,target)
    editorial_fallback(publications, DEST)
    (DEST/'.nojekyll').touch()
    if not (DEST/'index.html').exists():raise SystemExit('index.html mancante')
    print('Sito pubblico costruito in _site/, senza archivi privati o file sorgente.')
if __name__=='__main__':main()
