#!/usr/bin/env python3
"""Aggiorna la rassegna automatica conservando solo titoli, fonte, data e URL.

Per modificare le ricerche intervieni su CATEGORIE. Nessun articolo viene copiato.
Il feed esistente viene conservato se tutte le fonti risultano indisponibili.
"""

from __future__ import annotations

import json
import re
import ssl
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "web-news.json"
MAX_RESULTS = 120
MAX_AGE_DAYS = 90
NEWS_URL = "https://news.google.com/rss/search?"

# Ogni categoria è indipendente. Non confondere notizie del web e comunicati UDC.
CATEGORIE = {
    "udc_aprilia": {
        "label": "UDC Aprilia",
        "queries": ['"UDC" "Aprilia" when:90d', '"Pietro Fazio" "Aprilia" when:90d'],
        "required": r"\baprilia\b|\bpietro fazio\b",
        "priority": 1,
    },
    "comune_aprilia": {
        "label": "Comune di Aprilia",
        "queries": ['"Comune di Aprilia" delibere avvisi when:30d', '"Aprilia" comune amministrazione servizi when:30d'],
        "required": r"\baprilia\b",
        "priority": 2,
    },
    "regione_lazio": {
        "label": "Regione Lazio",
        "queries": ['"Regione Lazio" giunta consiglio provvedimenti when:30d', '"Consiglio regionale del Lazio" when:30d'],
        "required": r"regione lazio|consiglio regionale del lazio|giunta regionale del lazio",
        "priority": 3,
    },
    "udc_nazionale": {
        "label": "UDC nazionale",
        "queries": ['"UDC" "De Poli" when:60d', '"UDC" "Lorenzo Cesa" when:60d', '"Unione di Centro" politica when:30d'],
        "required": r"\budc\b|unione di centro|de poli|lorenzo cesa",
        "priority": 4,
    },
    "istituzioni": {
        "label": "Istituzioni italiane",
        "queries": ['site:governo.it comunicati when:30d', 'site:camera.it notizie when:30d', 'site:senato.it notizie when:30d'],
        "required": r"governo|camera dei deputati|senato|ministero|parlamento",
        "priority": 5,
    },
    "europa": {
        "label": "Europa e Unione europea",
        "queries": ['site:europarl.europa.eu notizie Italia when:30d', 'site:ec.europa.eu Italia decisioni when:30d', 'site:consilium.europa.eu comunicati when:30d'],
        "required": r"europ|commissione ue|parlamento ue|consiglio ue|unione europea",
        "priority": 6,
    },
}

# Aprilia è anche un marchio motociclistico: escludiamo i risultati non territoriali.
ESCLUSIONI = re.compile(
    r"motogp|motocicl|aprilia racing|rs 660|bezzecchi|piaggio|rsv4|motorbike",
    re.IGNORECASE,
)


def scarica_feed(query: str) -> bytes:
    params = urllib.parse.urlencode({"q": query, "hl": "it", "gl": "IT", "ceid": "IT:it"})
    request = urllib.request.Request(
        NEWS_URL + params,
        headers={"User-Agent": "UDCAprilia-Feed/2.0 (solo metadati e collegamenti)"},
    )
    with urllib.request.urlopen(request, timeout=20, context=ssl.create_default_context()) as response:
        return response.read(2_000_000)


def normalizza_titolo(title: str) -> str:
    return re.sub(r"[^\w]+", " ", title.casefold()).strip()


def estrai_notizie(xml: bytes, categoria: str, now: datetime | None = None) -> list[dict]:
    """Converte un RSS in notizie validate; utile anche per i test offline."""
    now = now or datetime.now(timezone.utc)
    config = CATEGORIE[categoria]
    required = re.compile(config["required"], re.IGNORECASE)
    root = ET.fromstring(xml)
    result = []

    for item in root.findall("./channel/item"):
        title = (item.findtext("title") or "").strip()
        url = (item.findtext("link") or "").strip()
        source_node = item.find("source")
        source = (source_node.text or "").strip() if source_node is not None else ""
        if source and title.endswith(" - " + source):
            title = title[: -(len(source) + 3)].strip()
        text = f"{title} {source}"

        if not title or not required.search(text):
            continue
        if categoria in ("udc_aprilia", "comune_aprilia") and ESCLUSIONI.search(text):
            continue
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme != "https" or not parsed.netloc:
            continue
        try:
            published = parsedate_to_datetime(item.findtext("pubDate") or "")
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            published = published.astimezone(timezone.utc)
        except (TypeError, ValueError, OverflowError):
            continue
        if not now - timedelta(days=MAX_AGE_DAYS) <= published <= now + timedelta(days=1):
            continue
        result.append({
            "title": title[:210],
            "date": published.date().isoformat(),
            "source": source[:100] or "Fonte esterna",
            "url": url,
            "category": config["label"],
            "priority": categoria,
        })
    return result


def deduplica(items: list[dict]) -> list[dict]:
    """Preferisce la categoria più specifica e, a parità, la notizia più recente."""
    ordered = sorted(
        items,
        key=lambda item: (
            CATEGORIE.get(item["priority"], {}).get("priority", 99),
            -int(item["date"].replace("-", "")),
        ),
    )
    urls, titles, result = set(), set(), []
    for item in ordered:
        title_key = normalizza_titolo(item["title"])
        url_key = item["url"].split("?", 1)[0].rstrip("/")
        if title_key in titles or url_key in urls:
            continue
        titles.add(title_key)
        urls.add(url_key)
        result.append(item)
    return result[:MAX_RESULTS]


def main() -> None:
    previous = {"updated_at": "", "items": []}
    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass

    results, errors = [], []
    for category, config in CATEGORIE.items():
        for query in config["queries"]:
            try:
                results.extend(estrai_notizie(scarica_feed(query), category))
            except (OSError, ValueError, ET.ParseError) as error:
                errors.append(f"{category}: {type(error).__name__}: {error}")

    if not results:
        print("Nessun risultato valido: archivio precedente mantenuto.")
        for error in errors:
            print("AVVISO:", error)
        return

    # Manteniamo temporaneamente le vecchie notizie delle categorie non recuperate.
    found = {item["priority"] for item in results}
    for item in previous.get("items", []):
        if (
            isinstance(item, dict)
            and item.get("priority") in CATEGORIE
            and item["priority"] not in found
            and isinstance(item.get("date"), str)
            and item["date"] >= (datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)).date().isoformat()
        ):
            results.append(item)

    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "items": deduplica(results),
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # La stessa rassegna dev'essere disponibile anche aprendo index.html da file://.
    # Mantiene sincronizzati i cataloghi locali con quelli pubblicati da GitHub Pages.
    snapshot_files = {
        "foto": "foto.json",
        "stampa": "stampa.json",
        "attivita": "attivita.json",
        "documenti": "documenti.json",
    }
    cataloghi = {}
    for key, filename in snapshot_files.items():
        path = OUTPUT.parent / filename
        cataloghi[key] = json.loads(path.read_text(encoding="utf-8"))
    cataloghi["webNews"] = payload
    destination = OUTPUT.parent.parent / "js" / "dati-locali.js"
    destination.write_text(
        "/* Cataloghi locali generati automaticamente. */\nwindow.UDCLocalData = "
        + json.dumps(cataloghi, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Aggiornamento completato: {len(payload['items'])} notizie; {len(errors)} ricerche non riuscite.")
    for error in errors:
        print("AVVISO:", error)


if __name__ == "__main__":
    main()
