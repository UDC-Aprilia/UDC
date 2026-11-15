# Notizie: pulsanti e modalità locale

## Aprire il sito sul PC
Aprire `index.html` dal contenuto di `UDC-main`. Anche con indirizzo `file:///C:/...` il sito usa `js/dati-locali.js` e mostra le schede editoriali, i pulsanti delle categorie e i comandi del carosello.

## Filtrare le notizie
I tasti **Tutte**, **UDC Aprilia**, **Comune di Aprilia**, **Regione Lazio**, **UDC nazionale · Cesa e De Poli**, **Istituzioni italiane**, **Europa e Unione europea**, **Rassegna stampa** ed **Eventi e attività** sono sempre presenti. Se non ci sono articoli per una categoria, appare un messaggio esplicito: non vengono inventate notizie.

## Pubblicazione e aggiornamenti
Pubblica **tutta** la cartella `UDC-main`, compresi `.github` e `js/dati-locali.js`. Da GitHub Actions avvia manualmente una volta `Aggiorna notizie del sito`; in seguito il workflow è programmato ogni sei ore (possono esserci ritardi). L'aggiornamento scrive sia `data/web-news.json` sia `js/dati-locali.js`: il secondo è la copia per la visualizzazione locale.

La pagina locale non acquisisce direttamente i feed online: per vederli in anteprima offline devi scaricare un nuovo archivio del repository dopo un aggiornamento GitHub Actions. Il sito pubblicato legge il JSON aggiornato normalmente.

## Manutenzione
Modifica i dati editoriali in `data/*.json`, non nel file generato `js/dati-locali.js`. Dopo modifiche ai cataloghi puoi rigenerare la copia locale con lo script `scripts/crea_copia_locale.py`.
