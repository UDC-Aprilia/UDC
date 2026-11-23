# Revisione 23 novembre 2026

- La pagina privacy deriva dal PDF `documenti/Informativa-Privacy-UDC-Aprilia-2026.pdf`. Sostituire **questo file con lo stesso nome** nel repository GitHub: il workflow `sincronizza-privacy.yml` rigenera `privacy.html` e la pubblica tramite il normale processo GitHub Pages. Il file Word non è sorgente della sincronizzazione.
- I PDF riconciliati sono stati rinominati con i nomi attesi dal catalogo. Le voci non verificabili sono state escluse dal catalogo pubblico: vedere `REPORT_RICONCILIAZIONE_PDF.md`. Non associare automaticamente comunicati diversi sulla sola data.
- I PDF presenti nelle cartelle ma non approvati nel catalogo **non** vengono copiati dalla build `scripts/prepara_sito_pubblico.py`. Per pubblicare un nuovo PDF, controllarlo e aggiungere una voce in `data/documenti.json` con `pubblica` e `verifica_privacy` impostati a true.
- La rassegna stampa (`data/stampa.json`) è un archivio di articoli esterni distinto dai comunicati. I collegamenti tra articoli e PDF richiedono verifica editoriale; non si creano equivalenze fittizie.
- Verificare che GitHub Pages distribuisca la cartella `_site` generata dal build oppure la radice del repository. Per evitare PDF non approvati online, usare la build filtrata. Verificare anche che i permessi Actions siano `Read and write permissions`.
- Il testo privacy richiede verifica giuridica, soprattutto per la corretta identificazione del titolare.
