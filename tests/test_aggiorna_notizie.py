"""Test del parser RSS/Atom attualmente usato da scripts/aggiorna_notizie.py.

Non fanno richieste di rete e usano soltanto feed fittizi locali.
"""
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from aggiorna_notizie import estrai_notizie, host_consentito

NOW = datetime(2026, 11, 16, tzinfo=timezone.utc)

class FeedTests(unittest.TestCase):
    def test_rss_udc_diretto_e_https(self):
        xml = b'''<rss><channel>
          <item><title>UDC Italia: una comunicazione</title><link>https://www.udc-italia.it/notizia/</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
          <item><title>UDC Italia: collegamento insicuro</title><link>http://www.udc-italia.it/no</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
          <item><title>UDC Italia: sito non verificato</title><link>https://notizie-non-verificate.test/no</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
        </channel></rss>'''
        result = estrai_notizie(xml, 'udc_nazionale', NOW)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['link_kind'], 'diretto')
        self.assertEqual(result[0]['url'], 'https://www.udc-italia.it/notizia/')

    def test_atom_europa(self):
        xml = b'''<feed xmlns="http://www.w3.org/2005/Atom"><entry>
        <title>Decisione del Parlamento europeo</title>
        <link rel="alternate" href="https://www.europarl.europa.eu/news/it/notizia"/>
        <updated>2026-11-14T10:00:00Z</updated>
        </entry></feed>'''
        result=estrai_notizie(xml, 'europa', NOW, source_override='Parlamento europeo')
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['source'], 'Parlamento europeo')

    def test_notizie_moto_escluse(self):
        xml = b'''<rss><channel>
          <item><title>Aprilia Racing vince in MotoGP</title><link>https://www.comune.aprilia.lt.it/notizia</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
          <item><title>Il Comune di Aprilia pubblica un avviso</title><link>https://www.comune.aprilia.lt.it/avviso</link><pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
        </channel></rss>'''
        result=estrai_notizie(xml,'aprilia',NOW)
        self.assertEqual(len(result), 1)
        self.assertIn('Comune di Aprilia', result[0]['title'])

    def test_google_news_richiede_fonte_ammessa(self):
        xml = b'''<rss><channel>
        <item><title>UDC Aprilia - incontro nel territorio</title>
        <link>https://news.google.com/rss/articles/123</link>
        <source url="https://www.udc-aprilia.it/">UDC Aprilia</source>
        <pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
        <item><title>UDC Aprilia - altro incontro</title>
        <link>https://news.google.com/rss/articles/456</link>
        <source url="https://invalid.example/">UDC Aprilia</source>
        <pubDate>Sat, 14 Nov 2026 11:30:00 GMT</pubDate></item>
        </channel></rss>'''
        result=estrai_notizie(xml,'udc_aprilia',NOW)
        self.assertEqual(len(result),1)
        self.assertEqual(result[0]['link_kind'],'aggregatore')

    def test_host_consentito_non_accetta_dominio_simile(self):
        self.assertTrue(host_consentito('https://www.udc-italia.it/',('udc-italia.it',)))
        self.assertFalse(host_consentito('https://udc-italia.it.invalid.example/',('udc-italia.it',)))

if __name__ == '__main__':
    unittest.main()
