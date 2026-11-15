# Notizie UDC e ritorno alla Home — 15 novembre 2026

## Per tornare al sito dopo un articolo

I titoli e i collegamenti delle notizie esterne si aprono in una **nuova scheda** del browser (`target="_blank"`). La home UDC Aprilia resta aperta nella scheda originale: selezionarla per tornare. I normali filtri **Tutte / Aprilia / Lazio / Italia / Europa / UDC** non portano fuori dal sito: filtrano soltanto le schede notizia presenti nella home.

## Pulsante Tutte

Alterna fino a 15 elementi per area con ordine casuale. Quando una categoria è priva di articoli scaricati, presenta un collegamento esplicitamente denominato **collegamento alla fonte, non articolo**. I contenuti effettivi dipendono dal popolamento del feed tramite GitHub Actions.

## Pulsante UDC

Comprende notizie su UDC Aprilia, UDC nazionale (Antonio De Poli e Lorenzo Cesa), UDC Lazio (Regino Brachetti) e UDC in provincia di Latina (Ciro Palumbo). Le ricerche sono limitate a siti verificabili, con controllo del dominio sorgente. Un risultato potrebbe non essere presente se il dominio non è autorizzato, la notizia non è recente o il feed esterno non la restituisce. Nessuna notizia viene inventata.

## Aggiornamento

Pubblicare **il contenuto** della cartella `UDC-main` nella radice del repository GitHub Pages; avviare GitHub Actions → Aggiorna notizie del sito → Run workflow. Aggiornamento programmato ogni 6 ore, nei limiti delle disponibilità di GitHub e dei feed esterni. In locale (`file:`) il sito usa `js/dati-locali.js` come catalogo offline: serve eseguire il workflow per vedere i dati nuovi.

## Nota editoriale

Il nome del coordinatore regionale è **Regino Brachetti**, come indicato nel sito nazionale UDC. I comunicati UDC e gli articoli di testate esterne restano chiaramente distinti.
