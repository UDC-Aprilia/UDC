"""Genera un unico catalogo pubblico da cartelle di contenuti approvati."""
import json
import re
from datetime import date
from pathlib import Path
import unicodedata
from urllib.parse import urlsplit

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
PROGRAM_FILE = 'programma-2027-2032.pdf'
COVER_NAMES = ('copertina.jpg', 'copertina.jpeg', 'copertina.png')
BOOK_FIELDS = ('Titolo', 'Autori', 'Pubblicazione')
BOOK_OPTIONAL = ('Sottotitolo', 'Tema', 'Descrizione', 'Editore', 'Anno', 'ISBN',
                 'Ordine', 'Nota', 'Link editore', 'Link pubblicazione', 'Nota link')
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


def record_dirs(base, category):
    for path in entries(directory(base / category)):
        if not path.is_dir() or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', path.name):
            raise ValueError(f'Cartella scheda non valida: {path}')
        yield path


def profile_dirs(base):
    return record_dirs(base, 'profili')


def read_text(path, limit):
    text = path.read_text(encoding='utf-8-sig').strip()
    if not text or len(text) > limit or re.search(r'[\x00-\x08\x0b-\x1f]', text):
        raise ValueError(f'Testo vuoto, troppo lungo o non valido: {path}')
    return text


def read_fields(path, required, optional=(), limit=16000):
    """Formato testo condiviso: una riga Campo: valore, in UTF-8."""
    fields = {}
    for line in read_text(path, limit).splitlines():
        if not line.strip():
            continue
        key, sep, value = line.partition(':')
        key = key.strip()
        if not sep or key not in (*required, *optional) or key in fields or not value.strip():
            raise ValueError(f'Campo non valido o ripetuto in {path}: {line}')
        fields[key] = value.strip()
    if not set(required).issubset(fields):
        raise ValueError(f'Campi mancanti in {path}: {set(required) - set(fields)}')
    return fields


def read_sheet(path):
    fields = read_fields(path, FIELDS, OPTIONAL_FIELDS, 4000)
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


def program(base):
    """Un solo PDF: il deposito nella cartella pubblica vale come autorizzazione."""
    folder = directory(base / 'programma')
    files = list(entries(folder))
    if not files:
        return None
    if len(files) != 1 or files[0].name != PROGRAM_FILE:
        raise ValueError(f'Usare soltanto {PROGRAM_FILE}: {folder}')
    row = media_row(files[0])
    row['versione'] = sha256(files[0])[:16]
    return row


def isbn13(value):
    digits = re.sub(r'[ -]', '', value)
    if (not re.fullmatch(r'97[89]\d{10}', digits)
            or sum(int(c) * (1 if i % 2 == 0 else 3)
                   for i, c in enumerate(digits)) % 10):
        raise ValueError(f'ISBN-13 non valido: {value}')
    return digits


def external_link(value):
    # URL espliciti: niente javascript:, credenziali, spazi o caratteri di controllo.
    if not value:
        return ''
    if re.search(r'[\s\\<>"\x00-\x1f]', value):
        raise ValueError(f'URL non valido: {value}')
    url = urlsplit(value)
    if url.scheme != 'https' or not url.hostname or url.username or url.password:
        raise ValueError(f'Usare un URL HTTPS pubblico: {value}')
    return value


def books(base):
    result = []
    identities = set()
    isbns = set()
    covers = set()
    for folder in record_dirs(base, 'cultura'):
        files = list(entries(folder))
        if not files:
            continue
        if any(not p.is_file() or p.name not in ('scheda.txt', *COVER_NAMES) for p in files):
            raise ValueError(f'Usare scheda.txt e una sola copertina: {folder}')
        fields = read_fields(folder / 'scheda.txt', BOOK_FIELDS, BOOK_OPTIONAL)
        state = fields['Pubblicazione'].casefold()
        if state not in ('sì', 'si', 'no'):
            raise ValueError(f'Pubblicazione: Sì o No in {folder}')
        identity = (normalized_name(fields['Titolo']), normalized_name(fields['Autori']))
        code = isbn13(fields['ISBN']) if 'ISBN' in fields else ''
        if identity in identities or (code and code in isbns):
            raise ValueError(f'Libro o ISBN duplicato: {folder}')
        identities.add(identity)
        if code:
            isbns.add(code)
        order = fields.get('Ordine', '9999')
        if not re.fullmatch(r'\d{1,4}', order):
            raise ValueError(f'Ordine non valido: {folder}')
        year = fields.get('Anno', '')
        if year and not re.fullmatch(r'\d{4}', year):
            raise ValueError(f'Anno non valido: {folder}')
        photos = [p for p in files if p.name in COVER_NAMES]
        if len(photos) > 1:
            raise ValueError(f'Una sola copertina per libro: {folder}')
        cover = photos[0] if photos else None
        digest = ''
        if cover:
            media_row(cover)
            digest = sha256(cover)
            if digest in covers:
                raise ValueError(f'Copertina identica in due libri: {folder}')
            covers.add(digest)
        publisher = external_link(fields.get('Link editore', ''))
        publication = external_link(fields.get('Link pubblicazione', ''))
        if state == 'no':
            continue
        result.append({
            'id': folder.name,
            'titolo': fields['Titolo'],
            'autori': fields['Autori'],
            'sottotitolo': fields.get('Sottotitolo', ''),
            'tema': fields.get('Tema', ''),
            'descrizione': fields.get('Descrizione', ''),
            'editore': fields.get('Editore', ''),
            'anno': year,
            'isbn': fields.get('ISBN', ''),
            'ordine': int(order),
            'nota': fields.get('Nota', ''),
            'link_editore': publisher,
            'link_pubblicazione': publication if publication != publisher else '',
            'nota_link': fields.get('Nota link', ''),
            'copertina': cover.name if cover else '',
            'versione': digest[:16],
        })
    return sorted(result, key=lambda b: (b['ordine'], b['titolo'].casefold(), b['id']))


def generate(root=ROOT):
    base = directory(root / BASE)
    result = {}
    for category in CATEGORIES:
        folder = directory(base / category)
        rows = [row for row, _ in unique_media(entries(folder))]
        result[category] = sorted(rows, key=lambda x: (x['data'], x['file']), reverse=True)
    result['profili'] = profiles(base)
    result['programma'] = program(base)
    result['cultura'] = books(base)
    output = root / 'js' / 'pubblicazioni.js'
    output.write_text(
        'window.UDCPubblicazioni = ' + json.dumps(result, ensure_ascii=True, indent=2) + ';\n',
        encoding='utf-8',
    )
    return result


if __name__ == '__main__':
    generate()
