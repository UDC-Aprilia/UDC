/* Tre articoli in evidenza in home. Mai spacciare un portale-fonte per una notizia. */
window.UDC_initHomeTeasers = async function ({ stampa = [] } = {}) {
    const root = document.getElementById('udc-home-teasers');
    if (!root)
        return;
    const { escapeHtml: esc, safeUrl, formatDate, uniqueNews, loadJson } = window.UDCUtils;
    let feed = { items: [] };
    try {
        feed = await loadJson('web-news.json', 'webNews');
    }
    catch (e) {
        console.warn('Notizie online non disponibili', e);
    }
    const labels = { udc_aprilia: 'UDC Aprilia', udc_nazionale: 'UDC nazionale', udc_lazio: 'UDC Lazio', udc_latina: 'UDC Latina', aprilia: 'Città di Aprilia', regione_lazio: 'Regione Lazio', italia: 'Italia', istituzioni: 'Istituzioni italiane', europa: 'Europa' };
    const fromWeb = (Array.isArray(feed.items) ? feed.items : []).filter(x => labels[x.priority] && x.title && x.url && x.date)
        .map(x => ({ title: x.title, href: x.url, date: x.date, source: x.source || 'Fonte verificabile', category: labels[x.priority], linkKind: x.link_kind || 'diretto' }));
    const press = stampa.filter(x => x.titolo && x.link && x.data)
        .map(x => ({ title: x.titolo, href: x.link, date: x.data, source: x.fonte || 'Rassegna stampa', category: 'UDC Aprilia', linkKind: 'diretto' }));
    // Il riquadro principale non presenta pubblicazioni molto vecchie come nuove.
    const recent = [...fromWeb, ...press].filter(x => {
        const days = Math.floor((Date.now() - Date.parse(x.date + 'T12:00:00Z')) / 86400000);
        return Number.isFinite(days) && days >= -1 && days <= 95;
    });
    const items = uniqueNews(recent).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    // Home: le sei pubblicazioni più recenti, senza rimescolare l'ordine cronologico.
    const selected = items.slice(0, 6);
    if (!selected.length) {
        root.innerHTML = '<p class="note">Nessun articolo aggiornato disponibile. <a href="notizie.html">Consulta le fonti nell’osservatorio →</a></p>';
        return;
    }
    root.innerHTML = selected.map(x => {
        const href = safeUrl(x.href);
        if (!href)
            return '';
        return `<article class="udc-teaser-card"><span class="udc-teaser-category">${esc(x.category)}</span><time datetime="${esc(x.date)}">${esc(formatDate(x.date))}</time><h3><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a></h3><p>${esc(x.source)}${x.linkKind === 'aggregatore' ? ' · via Google News' : ''}</p><a class="udc-teaser-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="Apri ${esc(x.title)} sul sito originale, in una nuova scheda">Apri l’articolo ↗</a><small>Si apre una nuova scheda; UDC Aprilia resta aperto.</small></article>`;
    }).join('');
};
