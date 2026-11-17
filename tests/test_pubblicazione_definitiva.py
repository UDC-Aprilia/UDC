import importlib.util
import tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('guard',ROOT/'scripts'/'valida_pubblicazione.py')
guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)

def setup(root):
    (root/'data').mkdir()
    for name in ('documenti','lettere'):
        (root/'data'/f'{name}.json').write_text('[]')
        (root/name/'2026').mkdir(parents=True)

def test_no_confidential_extensions():
    with tempfile.TemporaryDirectory() as d:
        root=Path(d);setup(root)
        (root/'assets').mkdir()
        (root/'assets'/'ricevuta.eml').write_text('example')
        assert guard.validate(root)==1

def test_no_private_subfolder():
    with tempfile.TemporaryDirectory() as d:
        root=Path(d);setup(root)
        (root/'assets'/'private').mkdir(parents=True)
        (root/'assets'/'private'/'nota.txt').write_text('example')
        assert guard.validate(root)==1
