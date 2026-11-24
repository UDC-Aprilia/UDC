# Gestione editoriale: programma e cultura

Questa guida sostituisce le istruzioni precedenti che richiedevano modifiche a js/sito.js.
Le cartelle nel repository sono `pubblicazioni/programma` e `pubblicazioni/cultura`.
Sul PC si trovano in `Documenti/UDC-Pubblicazioni`, dopo l'esecuzione della sincronizzazione già configurata.

## Programma amministrativo 2027–2032

1. Verificare l'approvazione del documento da parte dell'organo competente e includere nel PDF data ed estremi dell'approvazione.
2. Salvare il PDF pubblico come `programma-2027-2032.pdf` nella cartella `programma`. Il deposito in questa cartella è un'autorizzazione alla pubblicazione. Non inserire bozze, dati riservati o PDF di lavoro.
3. Per aggiornare, sostituire lo stesso file con la nuova versione approvata. Non aggiungere copie con nomi diversi. La firma PDF e SHA-256 vengono controllati; non si può verificare automaticamente l'approvazione o il contenuto.
4. Dopo la sincronizzazione Git e la build GitHub Pages, Home e Programma riflettono la presenza del documento. La pagina consente lettura e download. Il PDF è la fonte integrale: non viene estratto testo né creato un secondo documento.
5. Per ritirare il programma, eliminare il file sia dal PC sia dal repository, quindi rigenerare il sito. Rimuoverlo solo dal PC non ritira la pubblicazione. La cronologia Git può conservarne le copie precedenti.

Al momento della consegna il programma è assente: resta la comunicazione di mancata disponibilità. Non è inclusa alcuna bozza.

## Cultura e libri

I tre libri esistenti sono già migrati nelle rispettive cartelle. Per aggiungere un libro, creare una cartella sotto `cultura` con nome breve minuscolo, senza accenti, con trattini; ad esempio `titolo-del-libro`. Creare `scheda.txt` in UTF-8 con una riga per campo. Esempio fittizio:

```text
Titolo: Titolo del libro
Autori: Nome Cognome
Sottotitolo: Eventuale sottotitolo
Tema: Storia e cultura
Descrizione: Una breve presentazione del contenuto del libro.
Editore: Nome dell'editore
Anno: 2026
Link editore: https://example.org/libro
Ordine: 4
Pubblicazione: Sì
```

`Titolo`, `Autori` e `Pubblicazione` sono obbligatori; gli altri campi sono facoltativi. Omettere interamente le righe non compilate. Campi ulteriori ammessi: `ISBN` (ISBN-13 valido), `Link pubblicazione` (pagina diretta, oppure ricerca chiaramente dichiarata), `Nota`, `Nota link`. Non lasciare URL di esempio nei libri reali. Verificare i collegamenti prima di pubblicare; devono essere HTTPS assoluti, senza credenziali. Se i due URL coincidono, appare un solo collegamento.

Inserire una sola copertina autorizzata: `copertina.jpg`, `copertina.jpeg` oppure `copertina.png`. Se non presente, si usa una grafica tipografica. Non caricare il PDF integrale del libro: la sezione rimanda alle fonti editoriali, rispettando i diritti d'autore.

Per modificare un libro, mantenere la stessa cartella e modificare `scheda.txt` o sostituire la copertina (eliminare dal PC quella precedente se cambia estensione). Per oscurarlo, scrivere `Pubblicazione: No`; non significa cancellazione dal repository o dalla cronologia Git. L'ordine è crescente; se non indicato, il libro appare dopo quelli ordinati. In caso di titolo/autori normalizzati duplicati, ISBN duplicato o copertine identiche associate a libri diversi, la validazione blocca l'aggiornamento e conserva il sito già pubblicato. Il controllo non riconosce file visivamente identici ma ricompressi. Edizioni distinte con medesimo titolo e autori richiedono una scelta editoriale: una scheda per opera.

Per La società della longevità è stato inserito l'ISBN 979-12-986483-2-6 fornito dal gestore; checksum valido, attribuzione non verificata indipendentemente. Il collegamento Amazon è una ricerca per ISBN, non una scheda di acquisto confermata. Non sono stati inventati editore o anno.

## Sincronizzazione e prova

Usare il comando e l'attività pianificata già descritti in `GUIDA-PUBBLICAZIONE-AUTOMATICA.md`. Non serve una seconda attività. Le modifiche locali si propagano al repository; usare il PC designato come fonte editoriale e non modificare le stesse schede in parallelo su GitHub. Le schede esistenti vengono importate all'inizio. Un errore di validazione impedisce la copia dalla fase temporanea al clone. Non modificare a mano `js/pubblicazioni.js`: è un catalogo derivato, rigenerato automaticamente.

Eseguire `python scripts/prepara_sito_pubblico.py` per costruire `_site` e `python -m pytest -q` per i test (richiede pytest). Il build genera anche una versione essenziale di programma e libri senza JavaScript e usa l'impronta del catalogo per aggiornare la cache. La pubblicazione effettiva richiede GitHub Pages configurato e Git autenticato sul PC.
