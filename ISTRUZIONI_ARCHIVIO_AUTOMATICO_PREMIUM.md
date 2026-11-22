# Archivio stampa automatico — UDC Aprilia

## Attivazione
Caricare **tutti** i file di questa cartella nel ramo pubblicato su GitHub. In GitHub, aprire **Settings → Actions → General → Workflow permissions** e abilitare **Read and write permissions** (se consentito dal repository). Aprire **Actions → Aggiornamento archivio stampa → Run workflow** per il primo aggiornamento. Il workflow è pianificato tre volte al giorno (UTC); GitHub può ritardare o disabilitare le esecuzioni programmate. Per il funzionamento serve l'accesso pubblico ai feed Google News e un repository con Actions attivo.

## Che cosa viene archiviato
Il programma `scripts/aggiorna_rassegna.py` aggiunge riferimenti pubblici a `data/stampa.json`: data, titolo, fonte, link e provenienza. **Non** copia il testo completo degli articoli. Le segnalazioni automatiche possono essere imprecise e vanno verificate sulla testata; l'autore non viene inventato. La ricerca dei feed non è esaustiva e non importa automaticamente tutte le pubblicazioni del 2025–2026: per le lacune storiche utilizzare il pannello di inserimento o modificare `data/stampa.json`.

## Rimozione / blocco del reimport
Per eliminare una scheda, rimuoverla da `data/stampa.json`. Se la scheda proveniva dai feed, aggiungere il suo `id` a `ids`, oppure il suo URL a `urls`, oppure il titolo a `titles` nel file `data/stampa_esclusioni.json`. Altrimenti la segnalazione può ricomparire al successivo aggiornamento. Gli articoli già registrati non vengono eliminati automaticamente. Non salvare token GitHub nei file pubblici.

## Ricerca
La ricerca nell'archivio del sito funziona solo sui riferimenti effettivamente salvati nel JSON. Il pulsante **Cerca nella stampa online** apre Google News con i criteri inseriti: i risultati online non sono salvati automaticamente al semplice clic del visitatore. L'importazione automatica è effettuata dal workflow programmato, lato GitHub, e richiede il commit dei dati aggiornati.

## Diagnostica
Se non appaiono nuovi articoli, verificare il log del workflow in Actions, le autorizzazioni del repository e la disponibilità dei feed. Se il sito è pubblicato da un ramo diverso, verificare che `data/stampa.json` aggiornato venga effettivamente distribuito. La copertura dipende dai feed disponibili e dai criteri di pertinenza.
