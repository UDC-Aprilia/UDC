import importlib.util
import json
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('valida',ROOT/'scripts'/'valida_pubblicazione.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

def basic_tree(path):
    (path/'data').mkdir()
    for key in ('documenti','lettere'):
        (path/key/'2025').mkdir(parents=True)
        (path/'data'/f'{key}.json').write_text('[]')

def test_empty():
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp);basic_tree(root)
        assert module.validate(root)==0

def test_unapproved_pdf_blocks():
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp);basic_tree(root)
        (root/'lettere'/'2025'/'segreto.pdf').write_bytes(b'%PDF-1.4')
        assert module.validate(root)==1

def test_explicit_publication():
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp);basic_tree(root)
        (root/'lettere'/'2025'/'lettera.pdf').write_bytes(b'%PDF-1.4')
        row={'anno':'2025','data':'2025-10-02','titolo':'Richiesta','destinatario':'Comune',
        'file':'lettera.pdf','pubblica':True,'verifica_privacy':True,'stato_invio':'inviata','esito':'non-noto'}
        (root/'data'/'lettere.json').write_text(json.dumps([row]))
        assert module.validate(root)==0
        row['esito']='accolta'
        (root/'data'/'lettere.json').write_text(json.dumps([row]))
        assert module.validate(root)==1

def test_private_reply_blocks():
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp);basic_tree(root)
        (root/'lettere'/'2025'/'lettera.pdf').write_bytes(b'%PDF-1.4')
        row={'anno':'2025','data':'2025-10-02','titolo':'Richiesta','destinatario':'Comune',
        'file':'lettera.pdf','pubblica':True,'verifica_privacy':True,'stato_invio':'risposta-ricevuta',
        'data_risposta':'2025-10-03','esito':'in-valutazione','file_risposta':'risposta.pdf'}
        (root/'data'/'lettere.json').write_text(json.dumps([row]))
        assert module.validate(root)==1


def test_privacy_public_files_allowed_but_other_files_blocked():
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp);basic_tree(root)
        (root/'documenti'/'Informativa-Privacy-UDC-Aprilia-2026.pdf').write_bytes(b'%PDF-1.4')
        (root/'documenti'/'Informativa-Privacy-UDC-Aprilia-2026.docx').write_bytes(b'PK\x03\x04')
        assert module.validate(root)==0
        (root/'documenti'/'sconosciuto.docx').write_bytes(b'PK\x03\x04')
        assert module.validate(root)==1
        (root/'documenti'/'sconosciuto.docx').unlink()
        (root/'documenti'/'2025'/'non-approvato.pdf').write_bytes(b'%PDF-1.4')
        assert module.validate(root)==1
