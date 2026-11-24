import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from aggiorna_cartelle import generate
from sincronizza_cartelle_pc import copy_unique, seed_profiles

PDF = b'%PDF-1.4\nexample'
JPG = b'\xff\xd8\xffexample'
PNG = b'\x89PNG\r\n\x1a\nexample'


def sheet(folder, name, active='Sì', order=1):
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'scheda.txt').write_text(
        f'Nome: {name}\nIncarico: Componente\nCoordinamento: No\n'
        f'Direttivo: Sì\nConsiglio generale: Sì\nOrdine: {order}\nPubblicazione: {active}\n',
        encoding='utf-8',
    )
    return folder


def test_catalogo(tmp_path):
    (tmp_path / 'js').mkdir()
    folder = tmp_path / 'pubblicazioni' / 'eventi'
    folder.mkdir(parents=True)
    for name in ('a.pdf', 'b.pdf'):
        (folder / name).write_bytes(PDF)
    assert len(generate(tmp_path)['eventi']) == 1


def test_sincronizzazione(tmp_path):
    source = tmp_path / 'source'
    dest = tmp_path / 'dest'
    source.mkdir()
    dest.mkdir()
    (dest / 'a.pdf').write_bytes(PDF)
    (source / 'b.pdf').write_bytes(PDF)
    copy_unique(source, dest)
    assert not (dest / 'b.pdf').exists()
    (source / 'a.pdf').write_bytes(PDF + b'changed')
    with pytest.raises(ValueError):
        copy_unique(source, dest)
    assert (dest / 'a.pdf').read_bytes() == PDF


def test_profili_dinamici(tmp_path):
    (tmp_path / 'js').mkdir()
    base = tmp_path / 'pubblicazioni/profili'
    folder = sheet(base / 'nuovo-componente', 'Nuovo Componente', order=2)
    (folder / 'profilo.txt').write_text('Formazione\nEsperienza', encoding='utf-8')
    for name in ('curriculum.pdf', 'copia.pdf'):
        (folder / name).write_bytes(PDF)
    (folder / 'foto.jpg').write_bytes(JPG)
    (folder / 'duplicato.jpg').write_bytes(JPG)
    sheet(base / 'altro', 'Altro Componente', order=1)
    people = generate(tmp_path)['profili']
    assert [person['id'] for person in people] == ['altro', 'nuovo-componente']
    person = people[1]
    assert person['direttivo'] and person['consiglio']
    assert person['testo'] == 'Formazione\nEsperienza'
    assert person['foto'] == 'foto.jpg'
    assert [row['file'] for row in person['allegati']] == ['curriculum.pdf']
    (base / 'altro' / 'cv.pdf').write_bytes(PDF)
    with pytest.raises(ValueError, match='due profili'):
        generate(tmp_path)


def test_aggiornamento_profilo(tmp_path):
    source = tmp_path / 'source'
    dest = tmp_path / 'dest'
    source.mkdir()
    dest.mkdir()
    (source / 'profilo.txt').write_text('Nuovo')
    (dest / 'profilo.txt').write_text('Vecchio')
    (source / 'curriculum.pdf').write_bytes(PDF + b'new')
    (dest / 'curriculum.pdf').write_bytes(PDF)
    (source / 'foto.png').write_bytes(PNG)
    (dest / 'foto.jpg').write_bytes(JPG)
    (dest / 'vecchia-foto.jpg').write_bytes(JPG)
    (dest / 'vecchio-cv.pdf').write_bytes(PDF)
    copy_unique(source, dest, profile=True)
    assert (dest / 'profilo.txt').read_text() == 'Nuovo'
    assert (dest / 'curriculum.pdf').read_bytes() == PDF + b'new'
    assert (dest / 'foto.png').read_bytes() == PNG
    assert not (dest / 'foto.jpg').exists()
    assert len(list(dest.iterdir())) == 3
    copy_unique(source, dest, profile=True)
    assert len(list(dest.iterdir())) == 3


def test_nominativo_duplicato(tmp_path):
    (tmp_path / 'js').mkdir()
    base = tmp_path / 'pubblicazioni/profili'
    sheet(base / 'a', 'Mario Rossi')
    sheet(base / 'b', 'MARIO  ROSSI')
    with pytest.raises(ValueError, match='Nominativo duplicato'):
        generate(tmp_path)


def test_profilo_oscurato(tmp_path):
    (tmp_path / 'js').mkdir()
    folder = sheet(tmp_path / 'pubblicazioni/profili/a', 'Nome Esempio', active='No')
    (folder / 'profilo.txt').write_text('Testo non pubblicato')
    assert generate(tmp_path)['profili'] == []
    assert 'Testo non pubblicato' not in (tmp_path / 'js/pubblicazioni.js').read_text()


def test_importazione_iniziale(tmp_path):
    remote = tmp_path / 'remote'
    source = tmp_path / 'local'
    folder = sheet(remote / 'profili/a', 'Nome Esempio')
    (folder / 'profilo.txt').write_text('Precedente')
    local = source / 'profili/a'
    local.mkdir(parents=True)
    (local / 'profilo.txt').write_text('Locale')
    seed_profiles(source, remote)
    assert (local / 'scheda.txt').exists()
    assert (local / 'profilo.txt').read_text() == 'Locale'


def test_due_foto_ufficiali(tmp_path):
    (tmp_path / 'js').mkdir()
    folder = sheet(tmp_path / 'pubblicazioni/profili/a', 'Nome Esempio')
    (folder / 'foto.jpg').write_bytes(JPG)
    (folder / 'foto.png').write_bytes(PNG)
    with pytest.raises(ValueError, match='Una sola foto'):
        generate(tmp_path)


def test_link_simbolico(tmp_path):
    (tmp_path / 'js').mkdir()
    folder = sheet(tmp_path / 'pubblicazioni/profili/a', 'Nome Esempio')
    (folder / 'foto.jpg').symlink_to(folder / 'scheda.txt')
    with pytest.raises(ValueError, match='simbolico'):
        generate(tmp_path)
