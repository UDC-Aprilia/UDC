# UDC Aprilia — guida alla manutenzione

Questa versione deriva dall'archivio `UDC-main(4).zip`. Conserva le 17 pagine, la navigazione e la struttura visuale preesistenti. I contenuti del sito rimangono distinti dalle notizie raccolte sul web.

## Dove intervenire

| Cosa modificare | File |
| --- | --- |
| Testi, nomi, organi, contatti e impostazioni | `js/contenuti.js` |
| Pagine pubbliche, menu e piè di pagina condivisi | `js/sito.js` |
| Carosello delle notizie e selettore categoria | `js/home-news.js` |
| Sicurezza dei link, date e escape HTML comuni | `js/utilita.js` |
| Grafica delle pagine pubbliche | `css/stile.css` |
| Foto pubblicate | `data/foto.json`, immagini in `assets/` |
| Rassegna stampa selezionata dalla redazione | `data/stampa.json` |
| Eventi e attività | `data/attivita.json` |
| Documenti ufficiali | `data/documenti.json` |
| Notizie recuperate automaticamente | `data/web-news.json` **generato, non modificare a mano** |
| Categorie, ricerche, filtri e deduplicazione del web | `scripts/aggiorna_notizie.py` |
| Esecuzione periodica su GitHub | `.github/workflows/notizie.yml` |

## Le sei sezioni di raccolta

1. UDC Aprilia — UDC Aprilia e Pietro Fazio.
2. Comune di Aprilia — comunicazioni, servizi, avvisi e amministrazione locale.
3. Regione Lazio — Consiglio, Giunta e provvedimenti regionali.
4. UDC nazionale — UDC, De Poli e Lorenzo Cesa.
5. Istituzioni italiane — Governo, Camera, Senato e ministeri.
6. Europa e Unione europea — Parlamento europeo, Commissione e Consiglio.

Le ricerche utilizzano i feed RSS di Google News. **Non sono collegamenti diretti alle API istituzionali:** i risultati dipendono dall'indicizzazione e possono essere incompleti. Ogni risultato va letto sulla fonte originale e non è un comunicato ufficiale UDC. Non vengono copiati i testi degli articoli.

## Pubblicazione

1. Carica **il contenuto della cartella `UDC-main`**, inclusa la directory nascosta `.github`, nella radice del repository GitHub Pages.
2. In GitHub, apri **Actions → Aggiorna notizie del sito → Run workflow** per la prima esecuzione.
3. Il workflow tenta l'aggiornamento ogni sei ore; GitHub può ritardare o non eseguire immediatamente un processo pianificato. Le impostazioni del repository devono consentire a GitHub Actions di scrivere sui contenuti; le regole di protezione del branch possono impedire il push.
4. La pagina carica il JSON generato dal repository pubblicato; se il feed non è disponibile continua a mostrare la rassegna editoriale esistente.

## Eseguire i controlli in locale

```bash
python -m unittest discover -s tests -v
python -m compileall -q scripts
node --check js/home-news.js
node --check js/sito.js
```

Per provare la raccolta è richiesta una connessione Internet:

```bash
python scripts/aggiorna_notizie.py
```

**Sicurezza:** non inserire token GitHub o password nel codice. La gestione notizie/foto via GitHub API già presente nel progetto richiede un token con permessi limitati; mantenere l'accesso ai dispositivi sotto controllo.

## Cambiamenti rispetto alla base

- Lo script di acquisizione RSS è stato riscritto con categorie centralizzate, controlli di validità, deduplica e tolleranza agli errori.
- Il widget Home è stato riscritto in funzioni più piccole, con categorie reali, filtro e scorrimento accessibile.
- Le funzioni ripetute di escape HTML, controllo URL, formato data e deduplica delle notizie sono raccolte in `js/utilita.js`.
- I fogli di stile sono stati riformattati per separare le regole e facilitare gli interventi.
- Il workflow GitHub Actions e i test offline sono nuovi.
- Il menu, i contenuti principali e le pagine esistenti sono stati conservati; non è stata effettuata una riprogettazione grafica.

## Limiti di verifica

L'archivio è stato verificato staticamente e con test offline. Il feed live RSS e la resa visiva su GitHub Pages richiedono una verifica dopo la pubblicazione. Non è possibile garantire il recupero di notizie per tutte le categorie in ogni esecuzione.
