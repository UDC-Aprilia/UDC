"""Sincronizza le copie approvate dal PC attraverso il clone Git esistente."""
import argparse
import shutil
import subprocess
import tempfile
from pathlib import Path

from aggiorna_cartelle import (
    CATEGORIES, PHOTO_NAMES, TEXT_NAMES, ROOT, directory, entries,
    generate, profile_dirs, media_row,
)
from impronte import sha256


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True).strip()


def copy_unique(source, destination, profile=False):
    """Sostituisce soltanto i file personali canonici; archivi incrementali."""
    paths = list(entries(source))
    if any(not path.is_file() for path in paths):
        raise ValueError(f'Sottocartella non ammessa: {source}')
    if profile:
        photos = [p for p in paths if p.name in PHOTO_NAMES]
        if len(photos) > 1:
            raise ValueError(f'Una sola foto ufficiale per profilo: {source}')
        canonical = {*TEXT_NAMES, *PHOTO_NAMES, 'curriculum.pdf'}
        # Elimina copie rinominate già presenti prima di sostituire i canonici.
        # Altrimenti una vecchia copia potrebbe riapparire come allegato.
        canonical_hashes = {
            sha256(path)
            for path in entries(destination)
            if path.name in (*PHOTO_NAMES, 'curriculum.pdf')
        }
        for path in list(entries(destination)):
            if path.name not in canonical and sha256(path) in canonical_hashes:
                path.unlink()
        # La nuova foto sostituisce anche quella in un altro formato.
        if photos:
            for name in PHOTO_NAMES:
                if name != photos[0].name:
                    (destination / name).unlink(missing_ok=True)
        for path in paths:
            if path.name in canonical:
                target = destination / path.name
                if path.name not in TEXT_NAMES:
                    media_row(path)
                    # Conserva il nome canonico anziché una copia rinominata.
                    for existing in list(entries(destination)):
                        if existing.name not in canonical and sha256(existing) == sha256(path):
                            existing.unlink()
                if not target.exists() or sha256(target) != sha256(path):
                    shutil.copy2(path, target)
        paths = [p for p in paths if p.name not in canonical]
    known = {
        sha256(path)
        for path in entries(destination)
        if path.is_file() and path.name not in TEXT_NAMES
    }
    for path in paths:
        media_row(path)
        digest = sha256(path)
        if digest in known:
            print(f'Duplicato ignorato: {path.name}')
            continue
        target = destination / path.name
        if target.exists():
            raise ValueError(f'Nome già utilizzato: {target}; rinominare il nuovo file')
        shutil.copy2(path, target)
        known.add(digest)


def seed_profiles(source, repository):
    """Prima configurazione: importa le schede esistenti, senza sovrascrivere il PC."""
    for folder in profile_dirs(repository):
        target = directory(directory(source / 'profili') / folder.name)
        local = list(entries(target))
        if not (target / 'scheda.txt').exists():
            for path in entries(folder):
                if path.name in PHOTO_NAMES and any(p.name in PHOTO_NAMES for p in local):
                    continue
                if not (target / path.name).exists():
                    shutil.copy2(path, target / path.name)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('cartella', type=Path)
    source = parser.parse_args().cartella.resolve()
    if source == ROOT or ROOT in source.parents or source in ROOT.parents:
        raise SystemExit('Usare una cartella esterna al repository')
    if git('status', '--porcelain'):
        raise SystemExit('Clone non pulito: controllare le modifiche')
    git('pull', '--ff-only')
    for category in CATEGORIES:
        directory(source / category)
    seed_profiles(source, ROOT / 'pubblicazioni')
    with tempfile.TemporaryDirectory() as tmp:
        stage = Path(tmp)
        (stage / 'js').mkdir()
        shutil.copytree(ROOT / 'pubblicazioni', stage / 'pubblicazioni', symlinks=True)
        # Verifica il repository prima di qualsiasi modifica.
        generate(stage)
        for category in CATEGORIES:
            copy_unique(source / category, stage / 'pubblicazioni' / category)
        for folder in profile_dirs(source):
            destination = directory(stage / 'pubblicazioni' / 'profili' / folder.name)
            copy_unique(folder, destination, profile=True)
        # Controlla l'insieme completo, comprese le collisioni tra persone.
        generate(stage)
        # Propaga anche le rimozioni delle vecchie foto, non solo le aggiunte.
        target = ROOT / 'pubblicazioni'
        for path in target.rglob('*'):
            if path.is_file() and not (stage / path.relative_to(ROOT)).exists():
                path.unlink()
        shutil.copytree(stage / 'pubblicazioni', target, dirs_exist_ok=True)
    generate(ROOT)
    git('add', '--', 'pubblicazioni', 'js/pubblicazioni.js')
    if git('diff', '--cached', '--name-only'):
        git('commit', '-m', 'Aggiorna pubblicazioni approvate dal PC')
    git('push')


if __name__ == '__main__':
    main()
