import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def test_approvazione_esplicita():
    code = (ROOT / 'js/sito.js').read_text(encoding='utf-8')
    assert 'x.pubblica === true && x.verifica_privacy === true' in code
    assert 'x.risposta_pubblicabile === true && x.verifica_privacy_risposta === true' in code
    assert 'Sintesi del riscontro:' in code

def test_catalogo_inizialmente_vuoto():
    assert json.loads((ROOT / 'data/lettere.json').read_text(encoding='utf-8')) == []
