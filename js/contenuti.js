/* MODIFICA QUI i contenuti: ogni elemento tra { } e' una scheda. */
window.UDC = {
    nome: 'UDC Aprilia',
    territorio: 'Coordinamento comunale di Aprilia',
    nazionale: 'https://www.udc-italia.it/',
    // Aggiungi soltanto indirizzi ufficiali e verificati. Lascia '' se non disponibili.
    linkTerritoriali: [
        { nome: 'UDC nazionale', ambito: 'Nazionale', url: 'https://www.udc-italia.it/' },
        { nome: 'UDC Lazio', ambito: 'Regionale', url: '' },
        { nome: 'UDC Provincia di Latina', ambito: 'Provinciale', url: '' },
        { nome: 'UDC Aprilia', ambito: 'Comunale', url: 'index.html' }
    ],
    // I profili sono gestiti nelle cartelle pubblicazioni/profili.
    // Materiali d'archivio: non inventare date o dichiarazioni ufficiali.
    eventi: [
        { titolo: 'La politica dell’UDC: i territori al centro', data: '18 novembre 2026 · ore 18:00', luogo: 'Hotel Selene, Pomezia', descrizione: 'Incontro UDC sui territori e le nuove generazioni. Informazioni e partecipanti nella locandina.', foto: 'evento-udc-pomezia-18-novembre-2026.jpg', link: '' },
        { titolo: 'Festa nazionale UDC 2026', data: '12–13 settembre 2026', luogo: 'Roma', descrizione: 'Momenti di incontro, confronto e partecipazione alla Festa nazionale UDC.', foto: 'festa.jpg', link: 'https://www.udc-italia.it/festa-nazionale-udc-2026-12-13-settembre-roma/' },
        { titolo: 'Incontri e attività sul territorio', data: 'Archivio fotografico', luogo: 'Aprilia e territorio', descrizione: 'Fotografie delle attività e dei momenti istituzionali del coordinamento.', foto: 'nomina.jpg', link: '' }
    ],
    comunicati: [
        { data: '3 ottobre 2026', titolo: 'Ilaria Cavallin nominata vicecoordinatrice provinciale', testo: 'Rassegna stampa: conferimento dell’incarico provinciale con delega al tesseramento.', fonte: 'LatinaTu', link: 'https://latinatu.it/udc-torniamo-in-consiglio-regionale-e-ci-rafforziamo-in-provincia-di-latina/' },
        { data: '23 marzo 2026', titolo: 'Aprilia, confronto sul futuro amministrativo', testo: 'Rassegna stampa: intervento del coordinatore cittadino Pietro Fazio sul confronto politico e sulle prospettive amministrative della città.', fonte: 'Latina News', link: 'https://www.latinanews.eu/aprilia-ludc-a-dialogo-con-il-centrodestra/' }
    ],
    // FOTO DI RISERVA: il sito usa data/foto.json. Non modificare questo elenco per pubblicare foto.
    // Usa gestione-foto.html oppure modifica manualmente data/foto.json.
    foto: [
        { file: 'gruppo.jpg', titolo: 'Festa nazionale · foto di gruppo' },
        { file: 'convegno.jpg', titolo: 'Festa nazionale · sala convegno' },
        { file: 'festa.jpg', titolo: 'Festa nazionale · momento conclusivo' },
        { file: 'nomina.jpg', titolo: 'Incontro e attività istituzionale' },
    ],
    // Unica casella pubblica del coordinamento: tutte le richieste arrivano qui.
    contatti: {
        email: 'info@udc-aprilia.it',
        telefono: '',
        indirizzo: '',
        uffici: []
    }
};
