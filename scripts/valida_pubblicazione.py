#!/usr/bin/env python3
"""Controllo preventivo FAIL-CLOSED degli archivi PDF destinati a GitHub Pages.
Non può verificare che un documento sia giuridicamente pubblicabile: serve revisione umana.
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAFE = re.compile(r"[a-z0-9][a-z0-9_-]*\.pdf", re.I)
YEARS = re.compile(r"20\d{2}")
STATI = {'inviata', 'consegnata', 'protocollata', 'risposta-ricevuta'}
ESITI = {'non-noto', 'in-valutazione', 'accolta', 'parzialmente-accolta', 'non-accolta', 'nessun-riscontro'}
RISERVATI = re.compile(r'(ricevut[ae]|accettazione|consegna-pec|documento-identita|tessera|riservat|privat|sanitari|allegato-pec|\.p7m)', re.I)
DATE_FIELDS = ('data','data_consegna','data_protocollo','data_risposta')
# Informativa privacy pubblica preesistente, distinta dai comunicati stampa.
# L'eccezione è limitata a questi due nomi esatti nella sola cartella documenti/.
PRIVACY_PUBLIC_FILES = {
    Path('documenti/Informativa-Privacy-UDC-Aprilia-2026.pdf'),
    Path('documenti/Informativa-Privacy-UDC-Aprilia-2026.docx'),
}

def is_public_privacy_file(path, root):
    try: return path.relative_to(root) in PRIVACY_PUBLIC_FILES
    except ValueError: return False

# Soltanto i campi elencati possono entrare nel catalogo pubblico.
FIELDS = {
 'documenti': {'anno','data','titolo','descrizione','file','pubblica','verifica_privacy'},
 'lettere': {'anno','data','titolo','descrizione','file','destinatario','iniziativa','modalita_invio',
  'stato_invio','data_consegna','protocollo','data_protocollo','data_risposta','sintesi_risposta',
  'esito','nota_esito','file_risposta','risposta_pubblicabile','verifica_privacy_risposta',
  'pubblica','verifica_privacy'}
}

def parse_date(value):
    if not isinstance(value, str): return False
    try: return date.fromisoformat(value).isoformat() == value
    except (ValueError, TypeError): return False

def validate(root=ROOT):
    errors=[]
    def err(text): errors.append(text)
    refs={'documenti':set(), 'lettere':set()}
    for kind in ('documenti','lettere'):
        folder=root/kind
        manifest=root/'data'/f'{kind}.json'
        try: records=json.loads(manifest.read_text(encoding='utf-8'))
        except (OSError, json.JSONDecodeError) as exc: err(f'{manifest}: impossibile leggere JSON: {exc}');continue
        if not isinstance(records,list): err(f'{manifest}: deve contenere una lista');continue
        seen=set()
        for idx,x in enumerate(records,1):
            tag=f'{kind}.json voce {idx}'
            if not isinstance(x,dict): err(f'{tag}: non è un oggetto');continue
            extra=set(x)-FIELDS[kind]
            if extra: err(f'{tag}: campi non autorizzati nel catalogo pubblico: {sorted(extra)}')
            if x.get('pubblica') is not True or x.get('verifica_privacy') is not True:
                err(f'{tag}: pubblicazione e verifica privacy devono essere esplicitamente true')
            y=str(x.get('anno',''))
            if not YEARS.fullmatch(y): err(f'{tag}: anno non valido')
            filename=x.get('file')
            if not isinstance(filename,str) or not SAFE.fullmatch(filename) or RISERVATI.search(filename):
                err(f'{tag}: nome PDF non sicuro');continue
            if (y,filename) in seen: err(f'{tag}: file duplicato')
            seen.add((y,filename))
            for key in ('titolo',):
                if not isinstance(x.get(key),str) or not x[key].strip(): err(f'{tag}: {key} obbligatorio')
            for key in FIELDS[kind] - {'anno','pubblica','verifica_privacy','risposta_pubblicabile','verifica_privacy_risposta'}:
                if key in x and x[key] is not None and not isinstance(x[key],str): err(f'{tag}: {key} deve essere testo')
            for key in DATE_FIELDS:
                if key in x and x[key] and not parse_date(x[key]): err(f'{tag}: {key} deve essere data YYYY-MM-DD valida')
            if not parse_date(x.get('data')) or x.get('data','')[:4]!=y: err(f'{tag}: data e anno incoerenti')
            path=folder/y/filename
            refs[kind].add(path.resolve())
            if not path.is_file(): err(f'{tag}: PDF mancante {path.relative_to(root)}')
            elif not path.read_bytes().startswith(b'%PDF-'): err(f'{tag}: file non è un PDF riconoscibile')
            if kind=='lettere':
                if not isinstance(x.get('destinatario'),str) or not x['destinatario'].strip(): err(f'{tag}: destinatario obbligatorio')
                stato=x.get('stato_invio')
                if stato not in STATI: err(f'{tag}: stato_invio non valido')
                if x.get('esito') not in ESITI: err(f'{tag}: esito non valido')
                if x.get('data_consegna') and stato=='inviata': err(f'{tag}: consegna indicata ma stato solo inviata')
                if (x.get('protocollo') or x.get('data_protocollo')) and stato not in {'protocollata','risposta-ricevuta'}:
                    err(f'{tag}: protocollo non coerente con stato_invio')
                if x.get('data_protocollo') and not x.get('protocollo'): err(f'{tag}: data protocollo senza numero')
                if (x.get('data_risposta') or x.get('sintesi_risposta')) and stato!='risposta-ricevuta':
                    err(f'{tag}: riscontro richiede stato risposta-ricevuta')
                if stato=='risposta-ricevuta' and not x.get('data_risposta'): err(f'{tag}: manca data_risposta')
                if x.get('esito') in {'accolta','parzialmente-accolta','non-accolta'} and (stato!='risposta-ricevuta' or not x.get('nota_esito')):
                    err(f'{tag}: esito decisorio richiede risposta e motivazione documentata in nota_esito')
                if x.get('esito')=='nessun-riscontro' and stato=='risposta-ricevuta': err(f'{tag}: esito e stato incompatibili')
                reply=x.get('file_risposta')
                if reply:
                    if x.get('risposta_pubblicabile') is not True or x.get('verifica_privacy_risposta') is not True:
                        err(f'{tag}: risposta non esplicitamente autorizzata');continue
                    if not isinstance(reply,str) or not SAFE.fullmatch(reply) or RISERVATI.search(reply):
                        err(f'{tag}: nome PDF risposta non sicuro');continue
                    rp=folder/y/reply;refs[kind].add(rp.resolve())
                    if not rp.is_file(): err(f'{tag}: PDF risposta mancante {rp.relative_to(root)}')
                    elif not rp.read_bytes().startswith(b'%PDF-'): err(f'{tag}: file risposta non è PDF')
                elif x.get('risposta_pubblicabile') or x.get('verifica_privacy_risposta'):
                    err(f'{tag}: flag risposta senza PDF')
        if folder.exists():
            for path in folder.rglob('*'):
                if path.is_symlink(): err(f'Collegamento simbolico vietato: {path.relative_to(root)}');continue
                if not path.is_file() or path.name in {'.gitkeep', 'LEGGIMI.txt', 'README.md'}:continue
                if kind == 'documenti' and is_public_privacy_file(path, root):continue
                if path.suffix.lower()!='.pdf': err(f'File non previsto nelle cartelle pubbliche: {path.relative_to(root)}')
                elif path.resolve() not in refs[kind]: print(f'NON PUBBLICATO (non catalogato): {path.relative_to(root)}')
    # Nessuna cartella riservata deve essere inviata nel repository o negli ZIP pubblici.
    for parent in (root,root/'data',root/'documenti',root/'lettere'):
        if not parent.exists():continue
        for p in parent.iterdir():
            if p.name.lower() in {'riservato','riservati','private','privato','pec-originali','ricevute-pec'}:
                err(f'Cartella riservata dentro il sito: {p.relative_to(root)}')
    # Blocca per prudenza i nomi comunemente usati per archivi riservati e i formati PEC
    # in tutte le directory distribuite pubblicamente, non solo negli archivi PDF.
    scanned_roots=[root/'assets',root/'css',root/'js',root/'data',root/'documenti',root/'lettere']
    forbidden_ext={'.p7m','.eml','.msg','.pst','.p12','.pfx','.key','.pem','.zip','.7z','.rar','.docx','.xlsx'}
    private_names={'riservato','riservati','private','privato','ricevute','ricevute-pec','pec-originali','documenti-interni'}
    for base in scanned_roots:
        if not base.exists(): continue
        for entry in base.rglob('*'):
            if entry.is_symlink():err(f'Symlink vietato: {entry.relative_to(root)}');continue
            if any(part.lower() in private_names for part in entry.relative_to(root).parts):
                err(f'Percorso riservato nel sito: {entry.relative_to(root)}')
            if entry.is_file() and entry.suffix.lower() in forbidden_ext and not is_public_privacy_file(entry, root):
                err(f'Formato non ammesso nelle cartelle del sito: {entry.relative_to(root)}')
    for entry in root.iterdir():
        if entry.is_file() and entry.suffix.lower() in forbidden_ext:
            err(f'Formato non ammesso nella radice pubblica: {entry.name}')
    if errors:
        print('BLOCCO PUBBLICAZIONE:')
        for issue in errors: print(' - '+issue)
        return 1
    print('VALIDAZIONE OK: cataloghi e PDF pubblici coerenti (non è una verifica legale).')
    return 0

if __name__=='__main__': sys.exit(validate())
