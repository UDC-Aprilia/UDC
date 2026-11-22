# Correzioni ricerca e paginazione – 22 novembre 2026

- Ricerca: riconosce `after:AAAA-MM-GG` e `before:AAAA-MM-GG` anche se digitati nelle parole chiave; non duplica le date nel link Google News.
- Ricerca generica UDC Aprilia/Fazio: evita che la presenza di tutte le parole sia obbligatoria; per ricerche tematiche continua a richiedere i termini specifici.
- Archivio e stampa online: 10 risultati per pagina con navigazione numerata quando il filtro restituisce più di 10 risultati.
- Catalogo online: non elimina articoli di testate diverse soltanto per titolo uguale; deduplica per URL.
- Anteprima locale da ZIP: usa il catalogo incluso se il browser blocca `fetch` dei JSON locali.
- GitHub Actions: conservato il workflow RSS esistente. Deve essere abilitato e avere permessi di scrittura nel repository.

**Limiti:** la ricerca Google News aperta in una scheda esterna non può essere paginata dal sito. La paginazione riguarda gli articoli raccolti nel catalogo `data/stampa.json`. I feed RSS non garantiscono la raccolta di tutte le notizie. I risultati e i collegamenti con i PDF devono essere verificati.

**Prova:** aprire `comunicati.html`, svuotare i filtri, verificare il numero di risultati e poi cercare `UDC Aprilia` con le date. Le pagine compaiono soltanto oltre 10 risultati corrispondenti.
