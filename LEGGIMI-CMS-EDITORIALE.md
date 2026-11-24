# UDC Aprilia — programma e cultura dinamici

Versione basata su UDC-main-ottimizzato-profili-dinamici.zip.
Guida operativa: GUIDA-PROGRAMMA-E-CULTURA.md.

- Unico flusso di pubblicazione e unico catalogo derivato: programma, cultura, profili, archivi.
- Programma: un PDF canonico sostituibile, inizialmente assente; Home e pagina dedicata leggono lo stesso stato.
- Cultura: tre schede migrate, copertine spostate (non copiate), ISBN della Società della longevità aggiornato.
- Validazione di nomi canonici, SHA-256, ISBN-13, duplicati bibliografici, URL HTTPS e copertine.
- Build: file pubblici selezionati, fallback HTML per programma e libri, impronta del catalogo per la cache.
- File sorgente editoriali TXT non distribuiti da GitHub Pages; non contengano informazioni riservate, perché il repository può essere pubblico.
- Vecchi URL delle tre copertine in assets/ rimossi. Eliminare anche questi tre file dal repository durante l'aggiornamento. Vedere GUIDA-PROGRAMMA-E-CULTURA.md.
- ZIP senza _site, cache Python o cartella sorgenti_non_pubblicati. Conservare localmente eventuali sorgenti non pubbliche già possedute.

## Collaudo
54 test pytest superati, sintassi di tutti i JS verificata con Node, build con e senza un PDF di prova riuscita. Il PDF di prova è stato rimosso prima della consegna. Nessun gruppo di file PDF/JPG/JPEG/PNG con identico SHA-256 nell'archivio sorgente. Il browser locale si avvia ma blocca l'accesso HTTP locale (ERR_BLOCKED_BY_ADMINISTRATOR); il collaudo visivo non è stato completato. Non effettuati deploy live, verifica dei link esterni o sincronizzazione autenticata Windows/GitHub. ISBN fornito dall'utente validato matematicamente, non verificato presso editore. Gli URL preesistenti sono mantenuti; per la longevità si usa una ricerca Amazon per ISBN, non una scheda diretta confermata.
