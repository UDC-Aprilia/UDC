"""Controlli di coerenza per la pubblicazione Privacy UDC Aprilia.
Non eseguono richieste di rete.
"""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EMAIL = 'info@udc-aprilia.it'
EMAIL_RE = re.compile(r'[A-Za-z0-9_.+%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', re.I)

class PrivacyAndContactsTests(unittest.TestCase):
    def test_unico_indirizzo_in_sorgenti_testuali(self):
        extensions = {'.html', '.js', '.md', '.txt', '.json', '.py', '.xml', '.css'}
        found = set()
        for p in ROOT.rglob('*'):
            if p.is_file() and p.suffix.lower() in extensions:
                found.update(EMAIL_RE.findall(p.read_text(encoding='utf-8')))
        self.assertEqual(found, {EMAIL})

    def test_avvisi_privacy_disponibili(self):
        html = (ROOT / 'privacy.html').read_text(encoding='utf-8')
        self.assertEqual(len(re.findall(r'<h2>\d+\.', html)), 10)
        self.assertIn('16 novembre 2026', html)
        self.assertIn('Coordinamento comunale UDC Aprilia', html)
        self.assertIn('non oltre 12 mesi', html)
        self.assertIn('id="informativa-completa"', html)
        self.assertTrue((ROOT / 'documenti/Informativa-Privacy-UDC-Aprilia-2026.pdf').is_file())
        self.assertTrue((ROOT / 'documenti/Informativa-Privacy-UDC-Aprilia-2026.docx').is_file())
        js = (ROOT / 'js/sito.js').read_text(encoding='utf-8')
        self.assertIn('privacyStatic', js)

    def test_indirizzo_pubblico_unico(self):
        config = (ROOT / 'js/contenuti.js').read_text(encoding='utf-8')
        self.assertIn("email: 'info@udc-aprilia.it'", config)
        self.assertIn('uffici: []', config)
        site = (ROOT / 'js/sito.js').read_text(encoding='utf-8')
        self.assertIn(f'mailto:{EMAIL}', site)
        self.assertNotIn('segreteria@',site)
        self.assertNotIn('tesseramento@',site)

if __name__ == '__main__':
    unittest.main()
