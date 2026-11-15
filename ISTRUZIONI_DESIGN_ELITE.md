# UDC Aprilia — Home Elite Editorial (15 novembre 2026)

## Cambiamenti
- Un unico gruppo di sei filtri: Tutte, Aprilia, Lazio, Italia, Europa, UDC.
- Eliminati dalla barra filtri i duplicati Rassegna stampa ed Eventi e attività: sono link editoriali sotto il carosello.
- Portale Comune di Aprilia nella colonna informativa, accessibile senza mescolarlo ai filtri.
- Un articolo per volta, senza scrollbar orizzontale e senza card troncate.
- Scorrimento automatico, pausa, precedente/successivo e indicatore n/totale.
- Filtri: Italia comprende anche le istituzioni italiane; UDC comprende UDC Aprilia, UDC nazionale e contenuti redazionali.
- La selezione Tutte mescola le categorie disponibili.
- Su smartphone il pannello informativo va sotto la notizia.

## Fonte e limiti
La raccolta RSS/web continua a dipendere dal workflow GitHub Actions già incluso nel progetto.
Il file data/web-news.json del pacchetto caricato è vuoto: finché il workflow non recupera articoli,
sono mostrate schede chiaramente etichettate come collegamenti a fonti, non come notizie.
Non sono state inventate notizie o date. Nessuna modifica alle pagine interne.

## Pubblicazione
Caricare **il contenuto di UDC-main** nella root del repository GitHub Pages,
non creare un livello extra di cartella. Verificare Actions > Aggiorna notizie del sito
e controllare data/web-news.json. Svuotare la cache del browser con Ctrl+F5.

## Verifiche
Controllo sintattico Node.js sui due script modificati: OK.
Otto test Python per fonti/categorie: OK.
Non è stato possibile eseguire una prova visuale headless perché il browser di test blocca l'accesso locale.
