"""Regressioni per programma PDF, catalogo culturale e sincronizzazione."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from aggiorna_cartelle import COVER_NAMES, PROGRAM_FILE, generate, isbn13
from sincronizza_cartelle_pc import copy_canonical, seed_records

PDF = b'%PDF-1.4\nexample'
JPG = b'\xff\xd8\xffexample'
PNG = b'\x89PNG\r\n\x1a\nexample'


def setup(root):
    (root / 'js').mkdir()
    return root / 'pubblicazioni'


def book(base, slug='libro', title='Un libro', isbn='979-12-986483-2-6', extra=''):
    folder = base / 'cultura' / slug
    folder.mkdir(parents=True, exist_ok=True)
    text = f'Titolo: {title}\nAutori: Autore Esempio\nPubblicazione: Sì\n'
    if isbn:
        text += f'ISBN: {isbn}\n'
    (folder / 'scheda.txt').write_text(text + extra, encoding='utf-8')
    return folder


def test_programma_vuoto_e_aggiornato(tmp_path):
    base = setup(tmp_path)
    assert generate(tmp_path)['programma'] is None
    path = base / 'programma' / PROGRAM_FILE
    path.write_bytes(PDF)
    first = generate(tmp_path)['programma']
    path.write_bytes(PDF + b'updated')
    second = generate(tmp_path)['programma']
    assert first['file'] == second['file'] == PROGRAM_FILE
    assert first['versione'] != second['versione']


def test_programma_rifiuta_copie_e_formato(tmp_path):
    base = setup(tmp_path)
    generate(tmp_path)
    folder = base / 'programma'
    (folder / PROGRAM_FILE).write_bytes(PDF)
    (folder / 'copia.pdf').write_bytes(PDF)
    with pytest.raises(ValueError, match='Usare soltanto'):
        generate(tmp_path)
    (folder / 'copia.pdf').unlink()
    (folder / PROGRAM_FILE).write_bytes(b'invalid')
    with pytest.raises(ValueError, match='Firma'):
        generate(tmp_path)


def test_sostituzione_pdf(tmp_path):
    source = tmp_path / 'source'
    dest = tmp_path / 'dest'
    source.mkdir()
    dest.mkdir()
    (dest / PROGRAM_FILE).write_bytes(PDF)
    (source / PROGRAM_FILE).write_bytes(PDF + b'new')
    copy_canonical(source, dest, (PROGRAM_FILE,))
    assert (dest / PROGRAM_FILE).read_bytes() == PDF + b'new'
    before = (dest / PROGRAM_FILE).stat().st_mtime_ns
    copy_canonical(source, dest, (PROGRAM_FILE,))
    assert (dest / PROGRAM_FILE).stat().st_mtime_ns == before
    assert len(list(dest.iterdir())) == 1


def test_isbn():
    assert isbn13('979-12-986483-2-6') == '9791298648326'
    with pytest.raises(ValueError, match='ISBN'):
        isbn13('979-12-986483-2-7')


def test_catalogo_libri(tmp_path):
    base = setup(tmp_path)
    folder = book(base, extra='Link editore: https://example.org/libro\nLink pubblicazione: https://example.org/libro\nOrdine: 2\n')
    (folder / 'copertina.jpg').write_bytes(JPG)
    book(base, 'altro', 'Altro libro', '', 'Ordine: 1\n')
    rows = generate(tmp_path)['cultura']
    assert [r['id'] for r in rows] == ['altro', 'libro']
    assert rows[1]['isbn'] == '979-12-986483-2-6'
    assert rows[1]['link_editore'] == 'https://example.org/libro'
    assert rows[1]['link_pubblicazione'] == ''
    assert rows[1]['copertina'] == 'copertina.jpg'
    assert rows[0]['copertina'] == ''


def test_isbn_duplicato(tmp_path):
    base = setup(tmp_path)
    book(base)
    book(base, 'copia', 'Altro titolo', '9791298648326')
    with pytest.raises(ValueError, match='duplicato'):
        generate(tmp_path)


def test_titolo_duplicato(tmp_path):
    base = setup(tmp_path)
    book(base)
    book(base, 'copia', 'UN  LIBRO', '')
    with pytest.raises(ValueError, match='duplicato'):
        generate(tmp_path)


def test_copertina_duplicata(tmp_path):
    base = setup(tmp_path)
    (book(base) / 'copertina.jpg').write_bytes(JPG)
    (book(base, 'altro', 'Altro libro', '') / 'copertina.jpeg').write_bytes(JPG)
    with pytest.raises(ValueError, match='Copertina identica'):
        generate(tmp_path)


@pytest.mark.parametrize('url', ['javascript:alert(1)', 'https://utente:password@example.org', 'https://example.org/a b', '/libro'])
def test_link_non_sicuro(tmp_path, url):
    base = setup(tmp_path)
    book(base, extra=f'Link editore: {url}\n')
    with pytest.raises(ValueError, match='URL'):
        generate(tmp_path)


def test_libro_oscurato(tmp_path):
    base = setup(tmp_path)
    folder = book(base)
    sheet = folder / 'scheda.txt'
    sheet.write_text(sheet.read_text().replace('Pubblicazione: Sì', 'Pubblicazione: No'))
    assert generate(tmp_path)['cultura'] == []


def test_sostituzione_copertina(tmp_path):
    source = tmp_path / 'source'
    dest = tmp_path / 'dest'
    source.mkdir()
    dest.mkdir()
    (source / 'copertina.png').write_bytes(PNG)
    (dest / 'copertina.jpg').write_bytes(JPG)
    copy_canonical(source, dest, ('scheda.txt', *COVER_NAMES), COVER_NAMES)
    assert [p.name for p in dest.iterdir()] == ['copertina.png']


def test_seed_libri(tmp_path):
    remote = tmp_path / 'remote'
    local = tmp_path / 'local'
    folder = book(remote)
    (folder / 'copertina.jpg').write_bytes(JPG)
    seed_records(local, remote, 'cultura', COVER_NAMES)
    target = local / 'cultura/libro'
    assert (target / 'scheda.txt').exists()
    assert (target / 'copertina.jpg').exists()
    (target / 'scheda.txt').write_text('Modifica locale')
    seed_records(local, remote, 'cultura', COVER_NAMES)
    assert (target / 'scheda.txt').read_text() == 'Modifica locale'
