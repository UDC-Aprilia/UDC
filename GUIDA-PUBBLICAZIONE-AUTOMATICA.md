# Pubblicazione automatica – UDC Aprilia

## Prima configurazione
- Integrare lo ZIP nel repository GitHub esistente, conservando le personalizzazioni remote. Non caricare originali riservati o la cartella sorgenti_non_pubblicati nel repository pubblico.
- Settings > Pages > Build and deployment > Source: GitHub Actions. In Actions eseguire «Verifica e pubblica il sito» e controllare il risultato. Il workflow si avvia sui push main/master e ogni tre ore (anche per recepire aggiornamenti prodotti dagli altri workflow).
- Inserire solo copie già approvate nelle cinque cartelle di pubblicazioni/. Il deposito equivale a una decisione editoriale di pubblicazione. I controlli di formato non verificano privacy, diritti o contenuto.
- Titolo consigliato: 2026-11-24 - Incontro ad Aprilia.pdf. Data facoltativa; se assente non viene inventata. PDF/JPG/JPEG/PNG, anche con spazi e accenti. Non usare sottocartelle.
- Le nuove schede si aggiungono agli archivi esistenti; non modificano stati PEC, protocolli o esiti. Le foto nuove entrano anche nello slideshow; i PDF fotografici sono link separati.

## Cartella Documenti del PC Windows (facoltativo)
Il browser e GitHub non possono leggere direttamente il disco locale. Installare Git e Python 3, autenticare Git con accesso in scrittura, clonare il repository aggiornato in una cartella dedicata (senza altre modifiche locali). Aprire PowerShell nella radice del clone e lanciare:

```powershell
python scripts/sincronizza_cartelle_pc.py "$([Environment]::GetFolderPath('MyDocuments'))\UDC-Pubblicazioni"
```

Il comando crea le cinque sottocartelle e importa le schede personali esistenti, valida le copie, le aggiunge/aggiorna nel clone, esegue commit e push. Non cancella i file remoti quando vengono rimossi dal PC. Per rimuovere una pubblicazione cancellarla dal repository e dalla cartella locale; la cronologia Git può conservarla. Per automatizzare, in Utilità di pianificazione Windows creare un'attività ripetuta ogni 15 minuti, con programma il percorso assoluto di python.exe, argomenti il percorso assoluto di scripts/sincronizza_cartelle_pc.py e della cartella Documenti/UDC-Pubblicazioni (entrambi tra virgolette), e avvio nella radice del clone. Impostare «non avviare una nuova istanza» se già in esecuzione. Eseguire con l'utente Git autenticato, PC acceso e connesso. Verificare il primo avvio e gli errori; un clone con modifiche locali o conflitti richiede intervento manuale. Non usare la cartella per documenti privati. Non inserire token nel codice.

## Prova locale
`python scripts/prepara_sito_pubblico.py` genera _site; aprire _site/index.html o servire con `python -m http.server --directory _site 8000`. Per aggiornare solo l'anteprima sorgente: `python scripts/aggiorna_cartelle.py`.

Il sito live e le credenziali non sono stati verificati. La configurazione Windows/GitHub va effettuata sul proprio account.

## Prevenzione duplicati (versione ottimizzata)
Il confronto SHA-256 avviene nella stessa cartella di pubblicazione: copie identiche con nomi diversi sono ignorate dalla sincronizzazione e dal catalogo/build. Per gli archivi incrementali, se due contenuti diversi hanno lo stesso nome, la sincronizzazione si interrompe prima di modificare il clone. I file canonici dei profili sono invece sostituibili. Rinominare il nuovo file. La stessa risorsa in categorie diverse è ammessa intenzionalmente. Non vengono confrontate immagini ricompressate o PDF modificati, né i nuovi file con tutti gli archivi storici. Il caricamento tramite gli strumenti web preesistenti non usa questo controllo.

## Profili dei dirigenti
La sincronizzazione importa le tre cartelle personali esistenti e riconosce automaticamente le nuove cartelle con scheda.txt. Vedere GUIDA-PROFILI.md per nomi dei file, ruoli, sostituzioni e sospensione della pubblicazione.

## Programma e Cultura (CMS editoriale)
La stessa sincronizzazione crea anche `programma` e `cultura`, importa le schede dei libri esistenti e sostituisce i file canonici. Per programma e libri seguire `GUIDA-PROGRAMMA-E-CULTURA.md`, che sostituisce le vecchie indicazioni di modifica manuale. Il programma deve essere approvato prima del deposito. Non è necessaria un'altra attività pianificata.
