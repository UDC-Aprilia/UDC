# Lettere istituzionali ed esiti — pubblicazione sicura su GitHub Pages

## Principio di separazione

**Pubblico:** pagina `archivio-lettere.html`, schede approvate in `data/lettere.json`, lettere PDF controllate in `lettere/2025/` e `lettere/2026/`; risposte PDF soltanto dopo una distinta verifica.

**Riservato:** PEC complete, ricevute, allegati personali, documenti originali non oscurati e risposte non pubblicabili. Conservare su archivio privato esterno a GitHub Pages e **fuori da qualsiasi repository pubblico**, anche sotto cartelle denominate `privato` o `riservato`. Una cartella nel sito NON è un'area protetta.

## Compilare una scheda

1. Verificare la possibilità di pubblicare la lettera e predisporre una copia PDF adeguatamente oscurata, eliminando realmente i dati e i metadati superflui.
2. Caricare solo il PDF approvato in `lettere/2025/` o `lettere/2026/`.
3. Modificare `data/lettere.json` usando il modello sotto. Il JSON è **pubblico**: non inserirvi informazioni che devono rimanere riservate.
4. Mettere `pubblica: true` e `verifica_privacy: true` solo al termine del controllo. Altrimenti la scheda non sarà mostrata.
5. Riportare PEC, consegna e protocollo soltanto se realmente documentati. La protocollazione NON prova l'accoglimento.
6. Per una risposta integrale pubblicabile, caricare il PDF verificato nella stessa cartella annuale, e indicare `file_risposta`, `risposta_pubblicabile: true`, `verifica_privacy_risposta: true`. In caso contrario **omettere** il nome del file e pubblicare soltanto la sintesi legittimamente diffondibile.
7. Eseguire `python scripts/aggiorna_archivio_lettere.py` per controllare i riferimenti, poi effettuare Commit su GitHub.

**Esempio dimostrativo (non contiene fatti reali; NON incollare senza sostituirli):**

```json
[
  {
    "anno": "2026",
    "data": "2026-09-10",
    "titolo": "Richiesta di intervento — esempio",
    "descrizione": "Breve descrizione pubblicabile",
    "destinatario": "Ente pubblico — esempio",
    "file": "lettera-2026-09-10-esempio.pdf",
    "pubblica": true,
    "verifica_privacy": true,
    "iniziativa": "Oggetto della richiesta",
    "modalita_invio": "PEC",
    "stato_invio": "protocollata",
    "data_consegna": "2026-09-10",
    "protocollo": "ESEMPIO-123",
    "data_protocollo": "2026-09-11",
    "data_risposta": "2026-09-25",
    "sintesi_risposta": "L'ente ha comunicato che la richiesta è in valutazione.",
    "esito": "in-valutazione",
    "nota_esito": "In attesa di determinazioni definitive"
  }
]
```

Valori di `stato_invio`: `inviata`, `consegnata`, `protocollata`, `risposta-ricevuta`.
Valori di `esito`: `non-noto`, `in-valutazione`, `accolta`, `parzialmente-accolta`, `non-accolta`, `nessun-riscontro`.

### Pubblicazione solo dei file modificati

Estrarre lo ZIP PATCH e caricare i file nelle stesse posizioni del repository, senza creare una cartella aggiuntiva. Non caricare lo ZIP come file del sito. Se il repository contiene modifiche più recenti rispetto al pacchetto originale, confrontare prima i file per evitare sovrascritture.

### Nota essenziale

La modifica del codice non valuta automaticamente la liceità della pubblicazione: occorre controllare ogni singolo documento. Un PDF caricato in un repository pubblico può rimanere nelle versioni storiche anche dopo la cancellazione: evitare sempre di caricare contenuti riservati.
