# Aggiornamento automatico delle notizie della Home

Il workflow `.github/workflows/aggiornamento-home.yml` viene eseguito ogni 6 ore (UTC), oltre che manualmente da GitHub Actions > Aggiornamento automatico notizie Home > Run workflow.

## Attivazione

1. Pubblicare **tutto** il contenuto del progetto nel ramo GitHub da cui viene pubblicato il sito, inclusa la cartella nascosta `.github/workflows`.
2. In GitHub > Settings > Actions > General verificare che Actions sia abilitato e che `Workflow permissions` consenta **Read and write permissions** (quando disponibile). Il workflow richiede `contents: write`.
3. In Actions avviare una prima volta il workflow manualmente e verificare che l'esecuzione termini senza errori.
4. Controllare il commit aggiornato per `data/web-news.json` e `js/dati-locali.js`, quindi verificare la Home sul sito pubblicato. Se il sito usa un ramo di pubblicazione differente, assicurarsi che tali file raggiungano anche quel ramo.

## Come funziona

`scripts/aggiorna_notizie.py` interroga fonti RSS e ricerche Google News con domini selezionati. Aggiorna `data/web-news.json`, aggiorna anche la rassegna stampa se disponibile, e rigenera `js/dati-locali.js`, usato come catalogo locale. Il workflow pubblica i file modificati con un commit automatico.

Il workflow della rassegna stampa usa lo stesso gruppo di concorrenza per evitare push simultanei e rigenera il catalogo locale quando aggiorna l'archivio.

**Limiti:** la schedulazione GitHub non garantisce un orario preciso; le fonti possono essere indisponibili o non pubblicare nuovi articoli; non tutti i risultati del web sono accessibili. La prima esecuzione e il comportamento sul sito pubblicato devono essere verificati. L'aggiornamento automatico non equivale a una verifica editoriale del contenuto delle fonti.
