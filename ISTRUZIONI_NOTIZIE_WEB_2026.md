# Notizie web – configurazione aggiornata (15 novembre 2026)

## Comportamento della homepage

- **Tutte** raccoglie le notizie disponibili da tutte le aree, mescolando l'ordine di visualizzazione ad ogni selezione della scheda.
- I pulsanti **UDC Aprilia**, **Città di Aprilia**, **Regione Lazio**, **Italia · notizie nazionali**, **UDC nazionale**, **Istituzioni italiane**, **Europa e Unione europea**, **Rassegna stampa** ed **Eventi e attività** mostrano solo notizie di quella categoria.
- Il link **Sito del Comune ↗** apre il portale istituzionale, dove sono disponibili atti, Albo Pretorio e notizie.
- Ogni card riporta il titolo, la data, la fonte e un link all'articolo (o all'aggregatore RSS che lo segnala). Le fonti di collegamento alternative vengono mostrate come **collegamenti, non articoli**.
- Sono previsti pulsanti avanti, indietro e pausa/riprendi, pausa al passaggio del mouse e supporto a `prefers-reduced-motion`.

## Come funzionano gli aggiornamenti

1. Caricare la **totalità del contenuto della cartella `UDC-main`** nella radice del repository GitHub Pages, inclusa la cartella nascosta `.github/workflows`.
2. In GitHub, aprire **Actions > Aggiorna notizie del sito > Run workflow** per avviare la prima raccolta.
3. Il workflow successivamente tenta l'aggiornamento **ogni 6 ore**. GitHub può ritardare o sospendere gli avvii programmati. Verificare Actions e le autorizzazioni di scrittura del workflow.
4. Il programma Python recupera titoli, data e collegamento da RSS del Parlamento europeo e dalle ricerche Google News limitate ai domini dei siti selezionati. I risultati vengono controllati e salvati in `data/web-news.json` e `js/dati-locali.js`.
5. Se le fonti falliscono, i risultati recenti già presenti vengono mantenuti. Le categorie senza articoli propongono collegamenti diretti alle fonti, chiaramente identificati.

**IMPORTANTE:** Il file `data/web-news.json` incluso nello ZIP non contiene notizie recenti perché questo ambiente non ha accesso alla rete in uscita. Le nuove notizie compariranno solo dopo un aggiornamento GitHub Actions riuscito. Non si generano articoli di esempio fingendo che siano notizie attuali.

## Fonti e criteri

- Comune di Aprilia: https://www.comune.aprilia.lt.it/tipi-di-notizia/notizie e /avvisi
- Regione Lazio: https://www.regione.lazio.it/notizie e RSS istituzionali
- Istituzioni nazionali: https://www.governo.it/, https://www.camera.it/, https://www.senato.it/
- Europa: https://www.europarl.europa.eu/at-your-service/it/stay-informed/rss-feeds, https://commission.europa.eu/news-and-media_it e Consiglio UE
- Notizie nazionali: ANSA e portale della Presidenza del Consiglio
- UDC: sito nazionale e fonti locali autorizzate nella whitelist del programma

Alcuni collegamenti di notizie raccolte tramite Google News aprono una pagina di inoltro di Google News anziché direttamente la testata. La fonte originale è comunque indicata. La presenza di una categoria non garantisce che la fonte pubblichi ogni giorno. Per modificare query e domini consentiti: `scripts/aggiorna_notizie.py`.

## Test

`python -m unittest discover -s tests -v`

Il sito resta statico, senza API key o cookie richiesti per la rassegna. Le notizie di fonti esterne non sono comunicati ufficiali UDC.
