"""Impronte dei contenuti: confronto indipendente dal nome del file."""
import hashlib


def sha256(path):
    """Calcola l'impronta senza caricare tutto il file in memoria."""
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()
