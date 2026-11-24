/* Attività documentate delle strutture UDC: nessun articolo inventato. */
window.UDC_initReteUdc = async function () {
    const root = document.getElementById('rete-udc-feed');
    if (!root)
        return;
    const { escapeHtml: esc, safeUrl, formatDate, uniqueNews, loadJson } = window.UDCUtils;
    let feed = { items: [] }, stampa = [];
    try {
        feed = await loadJson('web-news.json', 'webNews');
    }
    catch (e) {
        console.warn('Feed non disponibile', e);
    }
    try {
        stampa = await loadJson('stampa.json', 'stampa');
    }
    catch (e) {
        console.warn('Rassegna non disponibile', e);
    }
    const news = (Array.isArray(feed.items) ? feed.items : []).filter(x => x && x.title && x.date && safeUrl(x.url))
        .map(x => ({ title: x.title, date: x.date, href: x.url, source: x.source || 'Fonte originale', group: x.priority, kind: x.link_kind || 'diretto' }));
    const local = (Array.isArray(stampa) ? stampa : []).filter(x => x.titolo && x.data && safeUrl(x.link))
        .map(x => ({ title: x.titolo, date: x.data, href: x.link, source: x.fonte || 'Rassegna stampa', group: 'udc_aprilia', kind: 'diretto' }));
    const items = uniqueNews([...news, ...local]).sort((a, b) => b.date.localeCompare(a.date));
    const topics = [
        { id: 'aprilia', name: 'UDC Aprilia', role: 'Coordinamento comunale', what: 'Comunicati e attività del territorio', test: x => x.group === 'udc_aprilia', more: 'comunicati.html', text: 'Rassegna stampa locale' },
        { id: 'latina', name: 'Ciro Palumbo', role: 'Coordinamento provinciale di Latina', what: 'Attività UDC nella provincia di Latina', test: x => x.group === 'udc_latina' || /Ciro\s+Palumbo/i.test(x.title), more: 'notizie.html?area=udc', text: 'Tutte le notizie UDC' },
        { id: 'lazio', name: 'Regino Brachetti', role: 'Coordinamento regionale UDC Lazio', what: 'Attività della rete regionale', test: x => x.group === 'udc_lazio' || /Regino\s+Brachetti/i.test(x.title), more: 'notizie.html?area=udc', text: 'Tutte le notizie UDC' },
        { id: 'depoli', name: 'Antonio De Poli', role: 'Senatore · UDC nazionale', what: 'Interventi e iniziative pubblicati', test: x => /De\s+Poli/i.test(x.title), more: 'https://www.udc-italia.it/_news/', text: 'Notizie ufficiali UDC' },
        { id: 'cesa', name: 'Lorenzo Cesa', role: 'UDC nazionale', what: 'Iniziative e interventi pubblicati', test: x => /Lorenzo\s+Cesa|\bCesa\b/i.test(x.title), more: 'https://www.udc-italia.it/_news/', text: 'Notizie ufficiali UDC' }
    ];
    root.innerHTML = topics.map(topic => {
        const found = items.filter(topic.test).slice(0, 3);
        const more = safeUrl(topic.more, true), external = more.startsWith('https:');
        return `<section class="rete-person" id="${esc(topic.id)}" aria-labelledby="rete-${esc(topic.id)}-title">
      <div class="rete-person-head"><span class="kicker">${esc(topic.role)}</span><h2 id="rete-${esc(topic.id)}-title">${esc(topic.name)}</h2><p>${esc(topic.what)}</p></div>
      <div class="rete-person-news">${found.length ? found.map(x => `<article class="rete-article"><time datetime="${esc(x.date)}">${esc(formatDate(x.date))}</time><h3><a href="${esc(safeUrl(x.href))}" target="_blank" rel="noopener noreferrer">${esc(x.title)} <span aria-hidden="true">↗</span></a></h3><p>${esc(x.source)}${x.kind === 'aggregatore' ? ' · tramite Google News' : ''}</p></article>`).join('') : '<p class="rete-empty">Nessun articolo recente disponibile nel catalogo per questa voce. Consulta le fonti e riprova dopo il prossimo aggiornamento.</p>'}
        <a class="rete-more" href="${esc(more)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(topic.text)} ${external ? '↗' : '→'}</a></div>
    </section>`;
    }).join('');
    const status = document.getElementById('rete-feed-date');
    if (status)
        status.textContent = feed.updated_at ? `Ultima raccolta automatica: ${formatDate(feed.updated_at.slice(0, 10))}.` : 'Catalogo iniziale, in attesa del primo aggiornamento GitHub Actions.';
};
