import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from aggiorna_notizie import parse_feed, https_url

class FeedTests(unittest.TestCase):
    def test_rss_politica(self):
        xml = b'''<rss><channel>
          <item><title>Lorenzo Cesa interviene in Parlamento</title><link>https://example.org/articolo</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
          <item><title>Aprilia Racing vince in MotoGP</title><link>https://example.org/moto</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
          <item><title>Test link insicuro</title><link>http://example.org/no</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
        </channel></rss>'''
        cfg = {'name':'UDC', 'category':'UDC e dirigenti nazionali', 'priority':5, 'max_age_days':60}
        result = parse_feed(xml, cfg, datetime(2026, 11, 15, tzinfo=timezone.utc))
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['via'], 'diretta')

    def test_atom(self):
        xml = b'''<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Regione Lazio: seduta della giunta</title><link rel="alternate" href="https://example.org/lazio"/><updated>2026-11-14T10:00:00Z</updated></entry></feed>'''
        cfg = {'name':'Lazio', 'category':'Regione Lazio', 'priority':3, 'political_only': True}
        self.assertEqual(len(parse_feed(xml, cfg, datetime(2026, 11, 15, tzinfo=timezone.utc))), 1)

    def test_https_only(self):
        self.assertIsNone(https_url('javascript:alert(1)'))
        self.assertIsNone(https_url('https://user:pass@example.org/'))

if __name__ == '__main__': unittest.main()

class LocalNewsTests(unittest.TestCase):
    def test_fazio_requires_name(self):
        xml = b'''<rss><channel><item><title>Pietro Fazio: UDC Aprilia</title><link>https://example.org/a</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item><item><title>Fazio senza nome</title><link>https://example.org/b</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item></channel></rss>'''
        cfg = {'name':'Fazio', 'category':'Pietro Fazio', 'priority':10, 'required_pattern':r'\bPietro\s+Fazio\b'}
        self.assertEqual(len(parse_feed(xml,cfg,datetime(2026,11,15,tzinfo=timezone.utc))),1)

    def test_comune_requires_official_source(self):
        xml = b'''<rss><channel><item><title>Avviso ufficiale del Comune</title><link>https://news.google.com/rss/articles/123</link><source url="https://www.comune.aprilia.lt.it/">Comune di Aprilia</source><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item><item><title>Altra notizia su Aprilia</title><link>https://news.google.com/rss/articles/456</link><source url="https://www.example.org/">Comune di Aprilia</source><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item></channel></rss>'''
        cfg = {'name':'Comune', 'category':'Comune di Aprilia', 'priority':8, 'kind':'google_news','official_domain':'comune.aprilia.lt.it'}
        result=parse_feed(xml,cfg,datetime(2026,11,15,tzinfo=timezone.utc))
        self.assertEqual(len(result),1)
        self.assertEqual(result[0]['source'],'Comune di Aprilia')

class EditorialSafetyTests(unittest.TestCase):
    def test_official_source_not_just_label(self):
        xml = b'<rss><channel><item><title>Avviso comunale</title><link>https://news.google.com/rss/articles/a</link><source url="https://example.com/">Comune di Aprilia</source><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item></channel></rss>'
        cfg = {"name":"Comune","category":"Comune di Aprilia","priority":7,"kind":"google_news","official_domain":"comune.aprilia.lt.it"}
        self.assertEqual(parse_feed(xml,cfg,datetime(2026,11,15,tzinfo=timezone.utc)), [])
