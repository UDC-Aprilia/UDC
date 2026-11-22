# Centro documentazione e ricerca stampa — novembre 2026

La pagina `comunicati.html` ora presenta una ricerca avanzata nell'intero archivio locale `data/stampa.json` (senza il precedente filtro esclusivo per Fazio e UDC Aprilia), con campi titolo, autore, fonte, argomento, date e ricerca libera. La selezione di notizie in movimento rimane focalizzata su Pietro Fazio e UDC Aprilia.

Il comando «Cerca nella stampa online» apre una ricerca aggiornata su Google News con le parole chiave e l'intervallo di date impostati. Si tratta di un servizio esterno: **non è una ricerca integrata nei risultati della pagina**, non garantisce copertura totale e può non trovare articoli non indicizzati o protetti. Non vengono importati o copiati automaticamente i contenuti degli editori.

Il sito è ospitabile come sito statico GitHub Pages: una ricerca esterna integrata con risultati direttamente nella pagina richiederebbe un servizio API/backend, gestione delle credenziali e verifica delle condizioni di utilizzo. I filtri autore e fonte funzionano in modo preciso nell'archivio locale, mentre la ricerca esterna usa parole chiave generiche.

Per l'aggiornamento automatico dell'archivio rimane necessario attivare il workflow esistente e verificare che le fonti RSS siano raggiungibili. Gli articoli importati automaticamente possono non contenere l'autore.
