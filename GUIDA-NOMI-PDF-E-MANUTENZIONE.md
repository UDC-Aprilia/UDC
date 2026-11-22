# Archivio comunicati UDC Aprilia — manutenzione

## Regola dei nomi PDF
Ogni comunicato è salvato in `documenti/ANNO/` con il formato `AAAA-MM-GG-titolo-breve.pdf`.
Usare solo lettere minuscole non accentate, numeri e trattini; evitare spazi e caratteri speciali.
In caso di titoli uguali nella stessa data, aggiungere `-2`, `-3` e così via.

## Aggiungere o aggiornare un comunicato
1. Copiare il PDF nella cartella dell'anno corrispondente.
2. Aggiungere o aggiornare la voce in `data/documenti.json`, indicando `anno`, `data`, `titolo`, `descrizione`, `file`, `pubblica` e `verifica_privacy`.
3. Assicurarsi che il campo `file` corrisponda **esattamente** al nome del PDF (GitHub Pages distingue maiuscole/minuscole).
4. Mantenere le voci del catalogo in ordine cronologico decrescente.
5. Verificare nel browser apertura, download e stampa dei PDF, sia in locale sia dopo la pubblicazione su GitHub Pages.

## Intervento effettuato
Rinominati 46 comunicati con data e titolo riconoscibili, senza alterare il contenuto dei PDF. Aggiornati i riferimenti testuali trovati nei file del sito e il catalogo `data/documenti.json`. L'informativa privacy non è stata rinominata.

## Pubblicazione
Caricare il **contenuto** della cartella `UDC-main` nella radice del repository (oppure configurare GitHub Pages in modo coerente). Prima di sostituire il sito online, eseguire una prova di navigazione completa.
