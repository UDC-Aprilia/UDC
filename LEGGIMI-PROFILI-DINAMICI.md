# UDC Aprilia – aggiornamento profili dinamici

Punto di partenza: UDC-main-ottimizzato-profili.zip.

- Un'unica fonte editoriale: pubblicazioni/profili/ con una cartella per persona.
- Migrazione dei tre nominativi, degli incarichi e delle tre foto già presenti. Biografia originale di Pietro Fazio conservata integralmente come testo editoriale, contatto conservato nella scheda. Eliminato il fallback hardcoded e rimossi i vecchi array dei dirigenti dal codice.
- Generazione dinamica dei componenti, appartenenza agli organi, ordinamento, sospensione, curriculum breve, foto e PDF sostituibili. Un unico componente grafico condiviso, adeguamento stili del profilo.
- Riutilizzo di SHA-256 e del workflow esistente. Il catalogo JS è un derivato generato, non una seconda fonte da aggiornare manualmente.
- Le cinque categorie di pubblicazione e gli archivi storici sono conservati. Non è stata riscritta tutta la logica storica del sito.

## Verifiche
39 test pytest superati, controllo sintattico di tutti i JavaScript, build del sito pubblico riuscita. La verifica statica del contenuto ha confermato le tre fotografie nella build e l'esclusione dei TXT sorgenti. Il tentativo di collaudo in Chromium locale è stato bloccato da ERR_BLOCKED_BY_ADMINISTRATOR; non è stato possibile verificare il rendering visivo. Non è stata effettuata una pubblicazione sul server o una sincronizzazione Git autenticata dal PC Windows.

## Attivazione
Leggere GUIDA-PROFILI.md e GUIDA-PUBBLICAZIONE-AUTOMATICA.md. Aggiornare il repository conservando eventuali modifiche remote ed eliminare i tre vecchi file assets/pietro.jpg, assets/ilaria.jpg, assets/cristina.jpg. La cartella sorgenti_non_pubblicati già presente nell'archivio di partenza non deve essere pubblicata né caricata su un repository pubblico. Non confondere l'oscuramento di una scheda nel sito con la riservatezza dei sorgenti Git.
