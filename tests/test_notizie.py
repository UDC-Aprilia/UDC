"""Test offline: python -m unittest discover -s tests -v"""
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from aggiorna_notizie import CATEGORIE, deduplica, estrai_notizie

DATE = 'Sun, 15 Nov 2026 07:00:00 GMT'


def feed(title, link='https://example.org/articolo'):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0"><channel><item><title>{title}</title>
    <link>{link}</link><pubDate>{DATE}</pubDate><source>Testata</source></item></channel></rss>'''.encode()


class NewsTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 11, 15, tzinfo=timezone.utc)

    def test_six_sections(self):
        self.assertEqual(len(CATEGORIE), 6)

    def test_aprilia_local(self):
        articles = estrai_notizie(feed('Comune di Aprilia: nuovi servizi'), 'comune_aprilia', self.now)
        self.assertEqual(articles[0]['priority'], 'comune_aprilia')

    def test_no_motorcycles(self):
        self.assertEqual(estrai_notizie(feed('Aprilia Racing MotoGP'), 'comune_aprilia', self.now), [])

    def test_no_insecure_urls(self):
        self.assertEqual(estrai_notizie(feed('Comune di Aprilia', 'http://example.org'), 'comune_aprilia', self.now), [])

    def test_independent_europe(self):
        articles = estrai_notizie(feed('Parlamento europeo: nuove decisioni'), 'europa', self.now)
        self.assertEqual(articles[0]['priority'], 'europa')

    def test_duplicate_titles(self):
        original = {
            'title': 'Comune di Aprilia', 'url': 'https://example.org/one',
            'date': '2026-11-15', 'priority': 'comune_aprilia', 'source': 'A',
        }
        second = {**original, 'url': 'https://example.org/two'}
        self.assertEqual(len(deduplica([original, second])), 1)


if __name__ == '__main__':
    unittest.main()
