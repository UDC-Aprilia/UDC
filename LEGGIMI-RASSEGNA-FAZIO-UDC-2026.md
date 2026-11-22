# Rassegna stampa: Fazio e UDC Aprilia

## Modifiche

- La pagina `comunicati.html` mostra soltanto le schede con un titolo riferito a Pietro Fazio oppure a UDC Aprilia. Le altre schede già presenti in `data/stampa.json` restano conservate ma non sono visualizzate in questa pagina.
- Il programma `scripts/aggiorna_rassegna.py` cerca periodicamente titoli pertinenti, anche su Latina News, tramite RSS di Google News. Conserva i risultati in `data/stampa.json` senza cancellare le schede esistenti.
- `scripts/aggiorna_notizie.py` richiama la ricerca della rassegna durante il normale aggiornamento del feed e rigenera `js/dati-locali.js`.
- La ricerca dell'osservatorio UDC Aprilia include ora anche il dominio `latinanews.eu`.

## Pubblicazione e aggiornamento

Caricare nel repository GitHub tutti i file di questo ZIP, mantenendo la struttura delle cartelle. Il workflow esistente che esegue `python scripts/aggiorna_notizie.py` attiverà anche la ricerca della rassegna. Se non è presente un workflow funzionante, occorre configurarlo su GitHub Actions. In alternativa eseguire `python scripts/aggiorna_notizie.py` in un ambiente con accesso Internet e pubblicare i file JSON e JS aggiornati.

## Articolo mancante e limiti

L'articolo «Fazio ad Aprilia, attenzione concreta della Regione Lazio» non è stato aggiunto manualmente perché non è stato possibile verificarne l'URL e la data. Per inserirlo con certezza, aprire `gestione-notizie.html` oppure aggiungere a `data/stampa.json` una scheda con data, titolo, fonte «Latina News» e URL reale dell'articolo. L'inserimento manuale lo rende permanente. I feed RSS non garantiscono la scoperta di ogni articolo, specialmente quelli più vecchi o non indicizzati; inoltre non attestano la firma del giornalista. Non vengono riprodotti testi integrali.

Le notizie raccolte automaticamente vengono indicate come segnalazioni da verificare sulla testata. La rassegna filtra in base al titolo, per evitare falsi positivi. Gli articoli che parlano di Fazio solo nel corpo e non nel titolo potrebbero richiedere inserimento manuale.
