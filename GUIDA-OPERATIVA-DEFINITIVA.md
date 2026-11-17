# UDC Aprilia — pubblicazione controllata e archivio privato

## Quale ZIP utilizzare
- **SITO-COMPLETO**: progetto completo di riferimento, non necessario per un normale aggiornamento.
- **SOLO-AGGIORNAMENTO**: contiene i file nuovi o diversi rispetto al pacchetto PREMIUM 10 originario; conservare una copia del repository prima di sostituire file esistenti.
- **ARCHIVIO-PRIVATO**: schema per un **altro** repository creato *Private*; **mai** caricarlo nel repository del sito.

## Regola fondamentale
Se il repository del sito è pubblico, **qualunque file caricato su GitHub può essere visto subito, anche se il workflow di pubblicazione fallisce**. GitHub Actions blocca il *deploy* di file non approvati, non la loro esposizione nel repository pubblico. Per questo i file vanno verificati **prima del commit**. La .gitignore non protegge i file caricati attraverso il browser.

## Prima pubblicazione / aggiornamento
1. Salvare una copia del repository online attuale.
2. Estrarre lo ZIP di solo aggiornamento; non caricare lo ZIP come file del sito.
3. Confrontare i file che hanno lo stesso nome, specialmente `js/sito.js`, i dati JSON e i workflow; evitare di perdere modifiche fatte online dopo l'ultimo ZIP.
4. Caricare le cartelle e i file nelle posizioni indicate, inclusi `.github/workflows/pubblica-sito.yml` e `scripts/`. GitHub Web può non mostrare cartelle vuote; i file `.gitkeep` le mantengono.
5. In **Settings > Pages > Build and deployment > Source** scegliere **GitHub Actions**. Verificare che il sito venga pubblicato dall'azione `Verifica e pubblica il sito (archivi approvati)`.
6. Verificare che la home, `archivio-comunicati.html`, `archivio-lettere.html`, CSS e menu funzionino.
7. Non caricare file privati. Per i PDF, prima controllare legittimità, dati personali e metadati; preparare versioni pubblicabili; registrare soltanto i file approvati nei JSON.
8. Prima del commit eseguire **localmente** `python scripts/valida_pubblicazione.py` e `python scripts/prepara_sito_pubblico.py`. Se si usa solo il browser, effettuare verifica manuale scrupolosa PRIMA dell'upload.

## Cosa significa ogni stato
- `inviata`: PEC spedita, consegna non attestata.
- `consegnata`: ricevuta di avvenuta consegna disponibile in archivio privato.
- `protocollata`: numero di protocollo comunicato o documentato dall'ente.
- `risposta-ricevuta`: riscontro acquisito.
- `accolta`, `non-accolta`, ecc.: esito da motivare con documento concreto, distinto da consegna e protocollo.

## Documenti e privacy
Le ricevute PEC complete e i PDF integrali non pubblicabili restano fuori dal sito. Il repository GitHub privato in dotazione è solo un **registro sintetico non sensibile**; non fornisce automaticamente conservazione a norma della PEC. Il testo dell'informativa privacy del sito NON è stato dichiarato definitivamente conforme: identificazione del titolare e gestione delle caselle richiedono conferma.

## Verifica tecnica e limiti
Gli script rilevano incongruenze, file non registrati, formati e stati non ammessi; non possono esaminare la liceità dei documenti, individuare tutti i dati personali in un PDF, né impedire l'accesso a file già caricati in un repository pubblico.
