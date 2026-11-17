import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def test_archivio_lettere():
    assert (ROOT/'archivio-lettere.html').is_file()
    assert (ROOT/'data/lettere.json').is_file()
    assert json.loads((ROOT/'data/lettere.json').read_text()) == []
    assert all((ROOT/'lettere'/y).is_dir() for y in ('2025','2026'))
    js = (ROOT/'js/sito.js').read_text()
    assert "documentCards(d.lettere || [], 'lettera')" in js
    assert "['lettere.json', 'lettere', 'lettere']" in js
    assert 'Lettere istituzionali' in js
