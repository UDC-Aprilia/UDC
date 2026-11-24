# Profili dinamici – guida unica

## 1. Dove modificare i contenuti

Sul PC: Documenti/UDC-Pubblicazioni/profili/. In alternativa, se non si usa la sincronizzazione dal PC, usare pubblicazioni/profili/ nel repository. Scegliere un solo punto di modifica per non sovrascrivere modifiche remote con copie locali obsolete.

Alla prima sincronizzazione vengono importate le schede e le foto esistenti di Pietro Fazio, Ilaria Cavallin e Cristina Picci. Il curriculum originale di Pietro è nel suo profilo.txt; non esiste più una biografia di riserva nel JavaScript. Non sono state inventate biografie delle vicecoordinatrici.

## 2. Aggiungere una persona

Creare una sottocartella con un identificativo stabile, minuscolo, senza accenti né spazi (es. nome-cognome). In Blocco note, salvare `scheda.txt` in UTF-8. Esempio da compilare con dati autorizzati:

```text
Nome: Nome Cognome
Incarico: Componente del Direttivo
Coordinamento: No
Direttivo: Sì
Consiglio generale: Sì
Ordine: 10
Pubblicazione: Sì
```

Le sette righe sono obbligatorie. È facoltativa la riga `Contatto: indirizzo-email-istituzionale` (sostituire con un indirizzo effettivo e autorizzato). L'ordine numerico è crescente; a parità di ordine si ordina per nome. Usare Sì/No per gli organi. Una persona con più incarichi ha una sola cartella e viene mostrata negli organi indicati; un membro del coordinamento già visibile nella pagina non viene ripetuto in un secondo riquadro della stessa pagina.

## 3. Aggiornare foto e curriculum

- `foto.jpg`, `foto.jpeg` oppure `foto.png`: una sola foto ufficiale. Sostituire il file precedente; se si cambia estensione, eliminare prima la vecchia foto dal PC. Il nuovo formato sostituisce quello remoto.
- `profilo.txt`: breve curriculum (facoltativo), in UTF-8, massimo 12000 caratteri. Primo paragrafo = presentazione; separare i paragrafi con righe vuote. Le intestazioni con `## ` sono mostrate nei dettagli espandibili, ad esempio:

```text
Breve presentazione professionale e istituzionale.

## Formazione accademica

Titoli di studio e specializzazioni.

## Esperienza professionale

Principali esperienze.
```

- `curriculum.pdf`: curriculum completo facoltativo. Sostituire il file con lo stesso nome per aggiornarlo. Il PDF non viene convertito in biografia: è consultabile nei dettagli anche senza testo. Le copie precedenti non vengono pubblicate insieme alla nuova.
- Ulteriori PDF e immagini possono essere aggiunti con nomi distinti. Un allegato non canonico diverso con lo stesso nome viene bloccato per evitare sovrascritture accidentali.

Il testo breve e il PDF hanno funzioni diverse; non è necessario ripetere tutto il PDF nel profilo. Usare soltanto il PDF se non si desidera mantenere il testo breve.

## 4. Nascondere o correggere

Per sospendere l'intera scheda impostare `Pubblicazione: No`. Il profilo e i suoi allegati sono esclusi dal sito generato. Per riattivarlo impostare Sì. Non basta cancellare la cartella locale: il sistema conserva il contenuto remoto. Per rimuovere definitivamente un singolo allegato o il testo breve occorre rimuoverlo sia dal PC sia dal repository; Git conserva la cronologia. Se si usa il PC come fonte, evitare modifiche concorrenti nel repository. Non inserire mai dati riservati, nemmeno in schede disattivate: un repository pubblico e la sua cronologia possono renderli accessibili. La pubblicazione non è una verifica del consenso o dei diritti.

## 5. Controlli e manutenzione

Il generatore `scripts/aggiorna_cartelle.py` scopre automaticamente le cartelle personali. Un solo catalogo generato (`js/pubblicazioni.js`) e una sola funzione grafica condivisa alimentano Direzione e direttivo e Consiglio generale. Non modificare a mano il catalogo. Il confronto SHA-256 elimina le copie binarie nell'indice e nella sincronizzazione; gli allegati identici in due profili attivi e i nominativi duplicati bloccano la pubblicazione. Non riconosce immagini ricompresse o persone omonime (in tal caso è necessaria una distinzione verificata del nome pubblico). Gli archivi storici restano separati. I vecchi URL diretti assets/pietro.jpg, assets/ilaria.jpg e assets/cristina.jpg non vengono mantenuti per evitare copie fisiche.

Per la sincronizzazione usare GUIDA-PUBBLICAZIONE-AUTOMATICA.md. Nessuna nuova attività pianificata. Per prova locale: `python scripts/prepara_sito_pubblico.py`, poi `python -m http.server --directory _site 8000` e aprire http://localhost:8000/organi.html.
