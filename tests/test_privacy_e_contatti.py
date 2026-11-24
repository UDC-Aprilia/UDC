import unittest
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]


class PrivacyTests(unittest.TestCase):
    def test_pdf_redirect(self):
        soup = BeautifulSoup((ROOT / 'privacy.html').read_text(), 'html.parser')
        target = 'documenti/Informativa-Privacy-UDC-Aprilia-2026.pdf'
        self.assertEqual(soup.select_one('meta[http-equiv="refresh"]')['content'], '0;url=' + target)
        self.assertEqual(soup.select_one('a')['href'], target)
        self.assertTrue((ROOT / target).read_bytes().startswith(b'%PDF-'))

    def test_js_privacy(self):
        self.assertIn('iniziativa personale di Pietro Fazio', (ROOT / 'js/sito.js').read_text())
