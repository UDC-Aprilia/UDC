# UDC Aprilia — Archivi pubblici e documenti riservati

## Regola fondamentale
**Un file caricato in un repository GitHub pubblico non è riservato**, anche se manca un collegamento nella pagina. Non caricare mai ricevute PEC complete, originali non pubblicabili, dati sanitari o documenti privati su GitHub. Anche una successiva cancellazione non elimina necessariamente il contenuto dalla cronologia Git.

## Procedura sicura (ordine obbligatorio)
1. Conserva **fuori da GitHub**, su spazio privato con accesso controllato, originali firmati, messaggi PEC e ricevute; gestisci correttamente i dati personali.
2. Predisponi **una copia PDF per la pubblicazione**, rimuovendo davvero dati personali, allegati e metadati non necessari. Il documento originale firmato rimane in archivio interno: una copia modificata non conserva la validità della firma originale.
3. Fai verificare il documento e la sintesi da una persona autorizzata; valuta anche reputazione, diritti di terzi e riservatezza delle risposte ricevute.
4. Copia il solo PDF approvato nella cartella `lettere/2025/` o `lettere/2026/` (per i comunicati `documenti/ANNO/`).
5. Aggiungi la voce a `data/lettere.json` oppure `data/documenti.json`, con `pubblica: true` e `verifica_privacy: true` **solo dopo verifica effettiva**.
6. Esegui `python scripts/valida_pubblicazione.py` prima del commit. Se fallisce, NON caricare.
7. Esegui commit e controlla GitHub Actions **Verifica e pubblica il sito**; la pubblicazione avviene soltanto se la verifica passa, se GitHub Pages è configurato su *GitHub Actions*.

## Configurazione una tantum (necessaria)
Apri **Settings > Pages > Build and deployment > Source: GitHub Actions**. Senza questo cambiamento, la pubblicazione dal branch può aggirare il controllo preventivo. Verifica che il branch del repository sia `main` o `master` e che Actions e Pages abbiano le autorizzazioni richieste. Il workflow preesistente per le notizie resta invariato.

## Esempio di voce per `data/lettere.json`
**Esempio fittizio, non inserire senza documenti reali**:
```json
{
  "anno": "2026",
  "data": "2026-11-10",
  "titolo": "Richiesta di intervento sulla viabilità",
  "descrizione": "Richiesta formale del coordinamento",
  "destinatario": "Comune di Aprilia",
  "iniziativa": "Richiesto un intervento sulla sicurezza stradale",
  "file": "lettera-viabilita.pdf",
  "pubblica": true,
  "verifica_privacy": true,
  "modalita_invio": "PEC",
  "stato_invio": "protocollata",
  "data_consegna": "2026-11-10",
  "protocollo": "NUMERO-VERIFICATO",
  "data_protocollo": "2026-11-11",
  "esito": "in-valutazione"
}
```
Per la risposta puoi inserire `data_risposta`, `sintesi_risposta`, cambiare `stato_invio` in `risposta-ricevuta` e aggiornare `esito` solo quando documentato. `file_risposta` è opzionale e richiede anche `risposta_pubblicabile: true` e `verifica_privacy_risposta: true`. Non mettere nel JSON indirizzi PEC personali, ricevute complete, dati riservati o informazioni che non vuoi rendere pubbliche.

## Esempio comunicato
```json
{
  "anno": "2026",
  "data": "2026-11-12",
  "titolo": "Titolo del comunicato",
  "descrizione": "Sintesi approvata",
  "file": "comunicato-esempio.pdf",
  "pubblica": true,
  "verifica_privacy": true
}
```

## Precauzioni
- Il controllo automatico **non** può certificare la liceità della pubblicazione o riconoscere tutti i dati personali contenuti nei PDF: serve sempre il controllo umano.
- Se una lettera non è pubblicabile, non inserirne il PDF nel repository; puoi eventualmente pubblicarne una sintesi lecita, ma l'archivio attuale richiede un PDF pubblico per ogni voce.
- Per aggiungere un anno nuovo, crea le cartelle e inserisci schede dell'anno corrispondente; l'interfaccia mostrerà anche gli anni oltre il 2026.
- Il repository deve essere usato come **sito pubblico**, non come archivio privato.
- Gli script `aggiorna_archivio_*` ora **validano soltanto** e non inseriscono PDF automaticamente.
- Prima di aggiornare un repository già personalizzato, confronta i file, non sovrascrivere alla cieca.
