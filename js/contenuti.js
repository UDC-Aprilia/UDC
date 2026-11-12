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
  dirigenti: [
    { nome: 'Pietro Fazio', incarico: 'Coordinatore comunale', foto: 'pietro.jpg' },
    { nome: 'Ilaria Cavallin', incarico: 'Vicecoordinatrice', foto: 'ilaria.jpg' },
    { nome: 'Cristina Picci', incarico: 'Vicecoordinatrice', foto: 'cristina.jpg' }
  ],
  // CONSIGLIO GENERALE: ogni componente avra' una foto in cornice rotonda.
  // Copia la foto in assets/ e aggiungi una riga come nell'esempio.
  consiglioGenerale: [
    // { nome: 'Nome Cognome', incarico: 'Componente del Consiglio generale', foto: 'nome-cognome.jpg' },
  ],
  // Aggiungi i membri del Consiglio Direttivo qui sotto, separati da virgole.
  direttivo: [
    // { nome: 'Nome Cognome', incarico: 'Componente del direttivo', foto: '' }
  ],
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
  // Indirizzi comunicati dal coordinamento: modificabili qui in un unico punto.
  contatti: {
    email: 'info@udc-aprilia.it',
    telefono: '',
    indirizzo: '',
    uffici: [
      { nome: 'Informazioni generali', email: 'info@udc-aprilia.it', descrizione: 'Informazioni e richieste generali.' },
      { nome: 'Segreteria', email: 'segreteria@udc-aprilia.it', descrizione: 'Comunicazioni e attività della segreteria.' },
      { nome: 'Coordinatore', email: 'coordinatore@udc-aprilia.it', descrizione: 'Comunicazioni indirizzate al coordinatore comunale.' },
      { nome: 'Ufficio stampa', email: 'stampa@udc-aprilia.it', descrizione: 'Richieste dei media e comunicazioni stampa.' },
      { nome: 'Organizzazione', email: 'organizzazione@udc-aprilia.it', descrizione: 'Eventi, incontri e attività organizzative.' },
      { nome: 'Tesseramento', email: 'tesseramento@udc-aprilia.it', descrizione: 'Informazioni sulle procedure di adesione.' }
    ]
  }
};
