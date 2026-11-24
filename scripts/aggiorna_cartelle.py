"""Genera un unico catalogo pubblico da cartelle di contenuti approvati."""
import json
import re
from datetime import date
from pathlib import Path
import unicodedata

from impronte import sha256

ROOT = Path(__file__).resolve().parents[1]
BASE = Path('pubblicazioni')
CATEGORIES = ('eventi', 'foto', 'lettere-inviate', 'lettere-ricevute', 'comunicati')
SIGNATURES = {
    '.pdf': b'%PDF-',
    '.jpg': b'\xff\xd8\xff',
    '.jpeg': b'\xff\xd8\xff',
    '.png': b'\x89PNG\r\n\x1a\n',
}
PHOTO_NAMES = ('foto.jpg', 'foto.jpeg', 'foto.png')
TEXT_NAMES = ('scheda.txt', 'profilo.txt')
FIELDS = ('Nome', 'Incarico', 'Coordinamento', 'Direttivo', 'Consiglio generale', 'Ordine', 'Pubblicazione')
OPTIONAL_FIELDS = ('Contatto',)


def directory(path):
    if path.is_symlink():
        raise ValueError(f'Cartella simbolica non ammessa: {path}')
    path.mkdir(parents=True, exist_ok=True)
    return path


def entries(folder):
    """Nessun link simbolico, anche se non indicizzato."""
    for path in sorted(folder.iterdir()):
        if path.is_symlink():
            raise ValueError(f'Link simbolico non ammesso: {path}')
        if path.name == '.gitkeep' and path.is_file():
            continue
        yield path


def profile_dirs(base):
    for path in entries(directory(base / 'profili')):
        if not path.is_dir() or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', path.name):
            raise ValueError(f'Cartella personale non valida: {path}')
        yield path


def read_text(path, limit):
    text = path.read_text(encoding='utf-8-sig').strip()
    if not text or len(text) > limit or re.search(r'[\x00-\x08\x0b-\x1f]', text):
        raise ValueError(f'Testo vuoto, troppo lungo o non valido: {path}')
    return text


def read_sheet(path):
    fields = {}
    for line in read_text(path, 4000).splitlines():
        if not line.strip():
            continue
        key, sep, value = line.partition(':')
        key = key.strip()
        if not sep or key not in (*FIELDS, *OPTIONAL_FIELDS) or key in fields or not value.strip():
            raise ValueError(f'Campo non valido o ripetuto in {path}: {line}')
        fields[key] = value.strip()
    if not set(FIELDS).issubset(fields):
        raise ValueError(f'Campi mancanti in {path}: {set(FIELDS) - set(fields)}')
    flags = {}
    for key in ('Coordinamento', 'Direttivo', 'Consiglio generale', 'Pubblicazione'):
        value = fields[key].casefold()
        if value not in ('sì', 'si', 'no'):
            raise ValueError(f'Usare Sì o No per {key}: {path}')
        flags[key] = value != 'no'
    if not re.fullmatch(r'\d{1,4}', fields['Ordine']):
        raise ValueError(f'Ordine non valido: {path}')
    if len(fields['Nome']) > 120 or len(fields['Incarico']) > 200:
        raise ValueError(f'Nome o incarico troppo lungo: {path}')
    if flags['Pubblicazione'] and not any(flags[key] for key in ('Coordinamento', 'Direttivo', 'Consiglio generale')):
        raise ValueError(f'Indicare almeno un organo: {path}')
    contact = fields.get('Contatto', '')
    if contact and not re.fullmatch(r'[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', contact):
        raise ValueError(f'Contatto email non valido: {path}')
    return {
        'nome': fields['Nome'],
        'contatto': contact,
        'incarico': fields['Incarico'],
        'coordinamento': flags['Coordinamento'],
        'direttivo': flags['Direttivo'],
        'consiglio': flags['Consiglio generale'],
        'ordine': int(fields['Ordine']),
        'pubblicazione': flags['Pubblicazione'],
    }


def media_row(path):
    if not path.is_file() or path.suffix.lower() not in SIGNATURES:
        raise ValueError(f'Formato non ammesso: {path}')
    if re.search(r'[\x00-\x1f\\]|riservat|ricevut[ae].*pec|identit[aà]|tesseramento', path.name, re.I):
        raise ValueError(f'Nome da verificare: {path}')
    ext = path.suffix.lower()
    with path.open('rb') as stream:
        if not stream.read(8).startswith(SIGNATURES[ext]):
            raise ValueError(f'Firma file non valida: {path}')
    title = path.stem
    day = ''
    if re.match(r'^\d{4}-\d{2}-\d{2}', title):
        day = date.fromisoformat(title[:10]).isoformat()
        title = title[10:].strip(' _-')
    return {
        'file': path.name,
        'titolo': title.replace('_', ' ').replace('-', ' ').strip() or path.stem,
        'data': day,
        'immagine': ext != '.pdf',
    }


def unique_media(paths):
    seen = set()
    for path in paths:
        row = media_row(path)
        digest = sha256(path)
        if digest in seen:
            print(f'Duplicato ignorato: {path}')
            continue
        seen.add(digest)
        yield row, digest


def normalized_name(name):
    return ''.join(c for c in unicodedata.normalize('NFKD', name.casefold()) if c.isalnum())


def profiles(base):
    result = []
    names = set()
    hashes = {}
    for folder in profile_dirs(base):
        files = list(entries(folder))
        if not files:
            continue
        if not (folder / 'scheda.txt').is_file():
            raise ValueError(f'Manca scheda.txt: {folder}')
        if any(not p.is_file() for p in files):
            raise ValueError(f'Sottocartella non ammessa: {folder}')
        person = read_sheet(folder / 'scheda.txt')
        name = normalized_name(person['nome'])
        if name in names:
            raise ValueError(f'Nominativo duplicato: {person["nome"]}')
        names.add(name)
        if not person.pop('pubblicazione'):
            continue
        person['id'] = folder.name
        bio = folder / 'profilo.txt'
        person['testo'] = read_text(bio, 12000) if bio.is_file() else ''
        photos = [p for p in files if p.name in PHOTO_NAMES]
        if len(photos) > 1:
            raise ValueError(f'Una sola foto ufficiale per profilo: {folder}')
        person['foto'] = photos[0].name if photos else ''
        person['foto_versione'] = sha256(photos[0])[:16] if photos else ''
        person['allegati'] = []
        media = [p for p in files if p.name not in TEXT_NAMES]
        # I nomi ufficiali hanno priorità rispetto a eventuali copie rinominate.
        media.sort(key=lambda p: (p.name not in PHOTO_NAMES, p.name != 'curriculum.pdf', p.name))
        for row, digest in unique_media(media):
            if digest in hashes:
                raise ValueError(f'Allegato identico in due profili: {folder / row["file"]} e {hashes[digest]}')
            hashes[digest] = folder / row['file']
            if row['file'] != person['foto']:
                row['versione'] = digest[:16]
                person['allegati'].append(row)
        result.append(person)
    return sorted(result, key=lambda p: (p['ordine'], p['nome'].casefold(), p['id']))


def generate(root=ROOT):
    base = directory(root / BASE)
    result = {}
    for category in CATEGORIES:
        folder = directory(base / category)
        rows = [row for row, _ in unique_media(entries(folder))]
        result[category] = sorted(rows, key=lambda x: (x['data'], x['file']), reverse=True)
    result['profili'] = profiles(base)
    output = root / 'js' / 'pubblicazioni.js'
    output.write_text(
        'window.UDCPubblicazioni = ' + json.dumps(result, ensure_ascii=True, indent=2) + ';\n',
        encoding='utf-8',
    )
    return result


if __name__ == '__main__':
    generate()
