# UDC Aprilia — Revisione Premium 10 (15 novembre 2026)

## Cosa è cambiato
- **Home più sintetica**: evento corrente compatto, tre accessi editoriali, anteprima di massimo tre articoli, un richiamo all’organizzazione e tesseramento. Restano tutte le pagine originarie e gli archivi.
- **Osservatorio**: il tasto *Tutte* alterna cinque macroaree (Aprilia, Lazio, Italia, Europa, UDC); i filtri dedicati restano selezionabili e condivisibili (`notizie.html?area=udc`, ecc.). Quando una categoria non ha notizie, compaiono **fonti separate**, non articoli inventati.
- **Attività UDC**: `rete-udc.html` riunisce contenuti per UDC Aprilia, Ciro Palumbo (Latina), Regino Brachetti (Lazio), Antonio De Poli e Lorenzo Cesa, a partire dai titoli realmente presenti nei dati del sito e dai collegamenti alla fonte. Le responsabilità pubblicate sono informazioni editoriali da revisionare periodicamente.
- **Torna alla Home**: pulsante fisso sull’Osservatorio e sulla pagina Attività UDC; i link esterni si aprono in una nuova scheda, che il visitatore può chiudere per tornare al sito.
- **Origine notizie**: feed diretti del Parlamento europeo e della Regione Lazio (fonti ufficiali), e tentativo feed UDC nazionale. Le ricerche Google News su domini selezionati sono usate dove manca un feed diretto e i link sono marcati come tali. Non confondere il passaggio da Google News con un URL diretto alla testata.

## Come pubblicare su GitHub Pages
1. Effettua una copia del repository attuale.
2. Apri lo ZIP ed entra in `UDC-main/`. Pubblica **il contenuto** di questa cartella nella radice del repository GitHub che ospita `udc-aprilia.it`. Non creare un doppio livello di cartelle.
3. Verifica che il dominio personalizzato in Settings → Pages sia `udc-aprilia.it`; il file `CNAME` è mantenuto. Non modificare i DNS dei servizi email.
4. Actions → **Aggiorna notizie del sito** → **Run workflow**. Lancia manualmente il primo aggiornamento; l'esecuzione automatica è pianificata ogni sei ore, ma può ritardare o essere sospesa. Verifica i log e l'avvenuto commit di `data/web-news.json`.
5. Premi Ctrl+F5 su `https://udc-aprilia.it/` e visita `notizie.html` e `rete-udc.html`.

## Come riconoscere un aggiornamento riuscito
- In `data/web-news.json`, il campo `updated_at` deve avere la data/ora dell'esecuzione; `items` deve contenere **articoli con titolo, data, fonte e url**.
- Se un feed rifiuta le richieste, il sistema mantiene gli ultimi contenuti validi; il sito non inventa notizie. Il messaggio in Osservatorio segnala se il feed è iniziale o vecchio.
- I link etichettati *tramite Google News* possono richiedere un passaggio intermedio: le testate mantengono la responsabilità dei contenuti.

## Controllo qualità prima della pubblicazione definitiva
- **Desktop**: Chrome/Edge 1440px e 1024px; controlla assenza di tagli e di scorrimenti orizzontali involontari.
- **Smartphone**: verifica i breakpoint da 320 a 430px e lo zoom fino al 200%; i menu e il pulsante Home devono essere accessibili.
- **Tastiera**: Tab attraverso menu e notizie; Invio per attivare; Esc per chiudere i sottomenu; indicatori di focus sempre visibili.
- **Movimento**: sistema operativo con *Riduci movimento* attivo; il carosello non deve partire automaticamente.
- **Fonti**: apri cinque link UDC e cinque istituzionali; conferma titolo/data/target.
- **Ricerca**: controlla `robots.txt`, `sitemap.xml`, canonical, la nuova pagina rete-udc e l'eventuale registrazione in Google Search Console (richiede accesso del proprietario).
- **Performance**: esegui PageSpeed Insights/Lighthouse sul sito **pubblicato** per smartphone e desktop. Correggi eventuali avvisi; i test locali non sono un voto Lighthouse.
- **Email**: il codice usa `mailto:` e NON invia messaggi da GitHub Pages. Verifica a parte SMTP/IMAP con Roundcube e i DNS di DominiOK. Per l'invio automatico dal sito servirebbe un servizio backend autorizzato (NON inserire credenziali nel codice pubblico).

## Sicurezza e privacy
Nessuna password, chiave SMTP o credenziale è stata aggiunta al sito. Il recupero RSS avviene in GitHub Actions; il browser legge soltanto il file JSON pubblicato. I link esterni usano `target="_blank" rel="noopener noreferrer"`. Le pagine di tesseramento restano separate; non raccogliere dati personali o relativi all'appartenenza politica in moduli pubblici non protetti.

## Test eseguiti per questa consegna
- Sintassi JS tramite `node --check`.
- Suite Python con unit test delle fonti e della whitelist.
- Controllo dei link e dei file statici.
- Test browser locale con Chromium/Playwright nelle risoluzioni previste, ove eseguibile.
- Integrity check ZIP.

**Nota**: la conformità WCAG 2.2 AA, il voto Lighthouse e la consegna effettiva della posta non possono essere certificati con i soli test locali. Richiedono verifica sul dominio pubblicato e, per la posta, sul server DominiOK.
