import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class PrivacyTests(unittest.TestCase):
 def test_ten_sections(self):
  from bs4 import BeautifulSoup
  soup=BeautifulSoup((ROOT/'privacy.html').read_text(), 'html.parser')
  self.assertEqual(len(soup.select('main h2')),11)
 def test_four_addresses(self):
  for email in ['info','segreteria','tesseramento','coordinatore']:
   self.assertIn(email+'@udc-aprilia.it',(ROOT/'privacy.html').read_text())
 def test_js_privacy(self):
  self.assertIn('iniziativa personale di Pietro Fazio',(ROOT/'js/sito.js').read_text())
if __name__=='__main__':unittest.main()
