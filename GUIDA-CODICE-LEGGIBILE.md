# GUIDA ALLA MANUTENZIONE DEL SITO UDC APRILIA

## Come è organizzato il codice

- `index.html`: pagina iniziale.
- Gli altri file `.html` nella cartella principale: pagine e sezioni del sito.
- `css/stile.css`: colori, impaginazione, menu e aspetto grafico generale.
- `css/gestione-notizie.css` e `css/gestione-foto.css`: interfacce di gestione.
- `js/sito.js`: navigazione e costruzione delle sezioni condivise.
- `js/contenuti.js`, `js/dati-locali.js`, `js/home-news.js`: dati e notizie visualizzati.
- `js/gestione-notizie.js` e `js/gestione-foto.js`: strumenti di gestione.
- `data/*.json`: cataloghi e informazioni strutturate. Un campo per riga e rientri uniformi.
- `assets/` e altre cartelle di risorse: immagini, PDF e documenti.

## Modificare un comunicato

1. Conservare una copia di sicurezza dell'intero sito.
2. Consultare `data/documenti.json` e le istruzioni specifiche già presenti nella cartella principale.
3. Modificare soltanto la voce interessata, mantenendo la sintassi JSON: virgolette doppie, virgole e parentesi.
4. Aggiungere il PDF nella cartella prevista, controllando che il percorso corrisponda esattamente.
5. Verificare data, titolo, eventuali duplicati, contenuto e autorizzazione alla pubblicazione.
6. Aprire il sito in anteprima e controllare i collegamenti prima di pubblicare.

## Modificare una pagina

Aprire il file `.html` corrispondente. I tag sono ora su righe separate e rientrati per mostrare la gerarchia della pagina. Non cambiare `id`, `class`, attributi `data-*` o percorsi di script se non si conoscono le dipendenze.

## Modificare grafica e funzioni

Modificare gli stili in `css/` e le funzioni in `js/`. I JavaScript esistenti sono stati conservati senza riscrittura automatica della logica, per non alterare il funzionamento; contengono ancora alcune istruzioni e strutture dati lunghe su una sola riga. Il CSS era già organizzato per blocchi e regole.

## Verifiche effettuate

- Formattazione HTML e JSON, senza eliminare sezioni o contenuti.
- Controllo sintattico dei JavaScript con `node --check`.
- Verifica della validità dei JSON.
- Conservazione di PDF, immagini, guide e altri file.

**Attenzione:** la riformattazione non equivale a un collaudo completo del sito online. Prima della sostituzione sul server controllare pagine, menu, strumenti di gestione, PDF e collegamenti.
