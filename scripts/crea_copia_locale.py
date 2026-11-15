"""Rigenera js/dati-locali.js dai cataloghi JSON pubblici; nessuna rete necessaria."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = {"foto": "foto.json", "stampa": "stampa.json", "attivita": "attivita.json", "documenti": "documenti.json", "webNews": "web-news.json"}
cataloghi = {key: json.loads((ROOT / "data" / name).read_text(encoding="utf-8")) for key, name in FILES.items()}
(ROOT / "js" / "dati-locali.js").write_text(
    "/* Cataloghi locali generati automaticamente. */\nwindow.UDCLocalData = "
    + json.dumps(cataloghi, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8"
)
print("Copia locale aggiornata: js/dati-locali.js")
