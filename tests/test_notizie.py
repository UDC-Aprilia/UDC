"""Test senza accesso a Internet: python -m unittest discover -s tests -v"""
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from aggiorna_notizie import CATEGORIE, deduplica, estrai_notizie

DATE = 'Sun, 15 Nov 2026 07:00:00 GMT'

def feed(title, url='https://news.google.com/rss/articles/test', source_url='https://www.comune.aprilia.lt.it/', source='Comune di Aprilia'):
    return f'''<?xml version="1.0"?><rss version="2.0"><channel><item><title>{title}</title>
    <link>{url}</link><pubDate>{DATE}</pubDate><source url="{source_url}">{source}</source>
    </item></channel></rss>'''.encode()

class NewsTests(unittest.TestCase):
    def setUp(self): self.now = datetime(2026,11,15,tzinfo=timezone.utc)
    def test_seven_sections(self): self.assertEqual(len(CATEGORIE),7)
    def test_aprilia_accepted(self):
        self.assertEqual(estrai_notizie(feed('Avviso pubblico per Aprilia'),'aprilia',self.now)[0]['priority'],'aprilia')
    def test_no_motorcycle(self):
        self.assertEqual(estrai_notizie(feed('Aprilia Racing MotoGP'),'aprilia',self.now),[])
    def test_untrusted_source_rejected(self):
        self.assertEqual(estrai_notizie(feed('Avviso Aprilia',source_url='https://spam.example.org'),'aprilia',self.now),[])
    def test_http_rejected(self):
        self.assertEqual(estrai_notizie(feed('Avviso Aprilia',url='http://www.comune.aprilia.lt.it/'),'aprilia',self.now),[])
    def test_europe_official_direct(self):
        self.assertEqual(len(estrai_notizie(feed('Parlamento europeo: nuova legge',url='https://www.europarl.europa.eu/news/it/press-room/test',source='Parlamento europeo'),'europa',self.now)),1)
    def test_no_other_domain_direct(self):
        self.assertEqual(estrai_notizie(feed('Parlamento europeo',url='https://example.org/a'),'europa',self.now),[])
    def test_duplicate_title(self):
        a={'title':'Avviso Aprilia','url':'https://example.org/one','date':'2026-11-15','priority':'aprilia','source':'Comune'}
        self.assertEqual(len(deduplica([a,{**a,'url':'https://example.org/two'}])),1)

if __name__=='__main__': unittest.main()
