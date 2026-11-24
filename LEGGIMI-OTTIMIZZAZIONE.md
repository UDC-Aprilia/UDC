# UDC Aprilia — versione ottimizzata

- 44 copie binarie eliminate, 11.814.860 byte recuperati. Consultare MAPPA-DUPLICATI.json per i percorsi precedenti e quelli conservati. I vecchi URL esterni possono non funzionare dopo la pubblicazione: non sono stati predisposti redirect per file binari.
- Cataloghi fotografici e riferimenti sorgente aggiornati; per fotografie identiche è conservata la prima scheda.
- JavaScript riformattato con parser TypeScript, senza minificazione. Le stringhe HTML incorporate e alcuni blocchi CSS/Python storici restano lunghi; non è stata effettuata una riscrittura integrale della logica. I due script di verifica degli archivi restano punti di ingresso compatibili e delegano già allo stesso validatore.
- scripts/impronte.py: funzione SHA-256 condivisa. scripts/aggiorna_cartelle.py: catalogo senza duplicati nella stessa categoria. scripts/sincronizza_cartelle_pc.py: sincronizzazione senza sovrascritture accidentali.
- Il PDF privacy è raggiungibile anche in anteprima locale. I test privacy sono stati aggiornati per verificare il redirect effettivo, non la precedente pagina HTML. I documenti storici non catalogati sono esclusi dal build; le lettere non autorizzate bloccano il build.
- Test locali: 32 superati con pytest; sintassi JS e build statico verificati. Nessun deploy, nessuna prova Windows/GitHub autenticata o collaudo grafico nel browser.
- Per manutenzione: leggere GUIDA-PUBBLICAZIONE-AUTOMATICA.md e GUIDA-CODICE-LEGGIBILE.md. Eseguire `python -m pytest -q` (richiede pytest e beautifulsoup4), `python scripts/prepara_sito_pubblico.py`. Conservare l'archivio precedente come backup. Per GitHub integrare le modifiche e rimuovere esplicitamente i percorsi della mappa, non limitarsi a sovrascrivere i file.
- Non caricare sorgenti_non_pubblicati o documenti non autorizzati in un repository pubblico. La cartella sorgenti è conservata nello ZIP per manutenzione locale.
