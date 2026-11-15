# UDC Aprilia — revisione navigazione e home Premium Elite (15 novembre 2026)

## Modifiche introdotte

- Home più sintetica: 3 notizie effettivamente disponibili in evidenza, senza portali generici spacciati per articoli.
- Nuova pagina `notizie.html`: carosello filtrabile Tutte / Aprilia / Lazio / Italia / Europa / UDC, con frecce e pausa.
- Se un filtro non contiene articoli, la pagina mostra un messaggio esplicito e link separati alle fonti originali.
- Link alle notizie esterne con apertura in nuova scheda e indicazione visibile; la scheda UDC Aprilia resta aperta.
- Percorso «← Torna alla home» nelle pagine interne. All'interno dei siti esterni non si possono aggiungere pulsanti di ritorno.
- Sezione completa «Identità e radici» spostata in Cultura, con anteprima fotografica compatta sulla home.
- Menu «Notizie ed eventi» aggiornato per includere l'Osservatorio notizie, e sitemap aggiornata.
- Rinnovati i parametri di versione di CSS e JavaScript nelle pagine per evitare l'uso di versioni memorizzate in cache.

## Come pubblicare

1. Fare una copia di sicurezza del repository esistente.
2. Caricare nel repository GitHub tutti i file contenuti **dentro** la cartella `UDC-main` (non caricare la cartella stessa come livello aggiuntivo).
3. Non modificare `CNAME` e le impostazioni DNS: questa revisione riguarda soltanto il sito web, non la posta DominiOK.
4. Dopo la pubblicazione, verificare `https://udc-aprilia.it/`, `https://udc-aprilia.it/notizie.html`, `https://udc-aprilia.it/cultura.html` e il menu da cellulare.
5. Su Windows usare Ctrl+F5 per forzare il ricaricamento.

## Contenuti e aggiornamento notizie

Gli articoli esterni continuano a provenire da `data/web-news.json` e dalla rassegna stampa editoriale.
Il codice **non garantisce** il popolamento automatico di tutte le categorie: dipende dal funzionamento del workflow GitHub Actions e dalle fonti pubblicate. Le fonti di consultazione sono sempre distinguibili dagli articoli veri.

## Verifica

Sintassi JavaScript verificata con `node --check`. Test Python originali superati. La verifica visiva nel browser va ripetuta dopo la pubblicazione effettiva.
