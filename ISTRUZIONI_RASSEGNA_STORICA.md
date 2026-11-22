# UDC Aprilia — Recupero storico e aggiornamento stampa

## Attivazione su GitHub

1. Caricare il contenuto di `UDC-main` nella **radice** del repository `UDC-Aprilia/UDC`, inclusa la cartella nascosta `.github`. Conservare prima un backup.
2. Aprire **Actions → Recupero storico rassegna stampa → Run workflow**. Inserire `2025-05-01` e `2026-11-22`, poi avviare. Il workflow cerca nei feed di Google News per singoli mesi, salva nuove schede e suggerisce possibili PDF correlati.
3. Aprire **Actions → Aggiornamento archivio stampa**: è già programmato tre volte al giorno e può essere avviato manualmente. Verificare che il job termini con successo e che il commit venga pubblicato.
4. Se il push fallisce per autorizzazioni, verificare **Settings → Actions → General → Workflow permissions → Read and write permissions** e le eventuali protezioni del ramo `main`.
5. Aprire `https://udc-aprilia.it/comunicati.html`, azzerare i filtri e verificare i contatori. I risultati si suddividono in pagine da **10** soltanto quando superano 10.

## Limiti e verifiche

- La ricerca storica è **incrementale**, ma i feed RSS e Google News non forniscono un archivio completo del web. Un comunicato PDF non implica che sia stato pubblicato da un giornale.
- I collegamenti ai PDF sono indicati **«da verificare»**: la somiglianza del titolo e la vicinanza temporale non dimostrano che un giornale abbia ripreso il comunicato.
- Il workflow storico è **manuale** per evitare decine di richieste ogni giorno; quello giornaliero acquisisce le nuove segnalazioni e suggerisce i PDF pertinenti.
- La pubblicazione resta su GitHub Pages; non serve cambiare il DNS su DominiOK.
- Gli articoli vengono salvati come metadati (titolo, data, testata, URL), non come testo integrale protetto da copyright.
- Non modificare manualmente `js/dati-locali.js`: viene rigenerato dai workflow.
