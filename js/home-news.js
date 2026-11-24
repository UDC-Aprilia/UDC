/** Carosello: Tutte mescola le aree; ogni filtro mostra esclusivamente la sua categoria. */
window.UDC_initHomeNews = async function ({ stampa = [], eventi = [] } = {}) {
    const root = document.getElementById('udc-news-widget');
    if (!root)
        return;
    const { escapeHtml: esc, safeUrl, formatDate, uniqueNews, loadJson } = window.UDCUtils;
    const LABELS = Object.freeze({
        udc_aprilia: 'UDC Aprilia', aprilia: 'Città di Aprilia', regione_lazio: 'Regione Lazio',
        italia: 'Italia · notizie nazionali', udc_nazionale: 'UDC nazionale', udc_lazio: 'UDC Lazio', udc_latina: 'UDC Latina e provincia',
        istituzioni: 'Istituzioni italiane', europa: 'Europa e Unione europea'
    });
    const LINKS = {
        'UDC Aprilia': [['Comunicati UDC Aprilia', 'archivio-comunicati.html']],
        'Città di Aprilia': [['Notizie del Comune di Aprilia', 'https://www.comune.aprilia.lt.it/tipi-di-notizia/notizie'], ['Avvisi pubblici del Comune', 'https://www.comune.aprilia.lt.it/tipi-di-notizia/avvisi']],
        'Regione Lazio': [['Notizie della Regione Lazio', 'https://www.regione.lazio.it/notizie']],
        'Italia · notizie nazionali': [['Notizie della Presidenza del Consiglio', 'https://www.governo.it/']],
        'UDC nazionale': [['Notizie ufficiali UDC · De Poli e Cesa', 'https://www.udc-italia.it/']],
        'UDC Lazio': [['UDC nazionale · notizie anche sul Lazio', 'https://www.udc-italia.it/']],
        'UDC Latina e provincia': [['Notizie UDC della provincia di Latina', 'https://latinatu.it/udc-nominato-il-coordinatore-provinciale-di-latina/']],
        'Istituzioni italiane': [['Attività del Parlamento italiano', 'https://www.parlamento.it/']],
        'Europa e Unione europea': [['Notizie del Parlamento europeo', 'https://www.europarl.europa.eu/news/it'], ['Notizie della Commissione europea', 'https://commission.europa.eu/news-and-media_it']],
        'Rassegna stampa': [['Archivio rassegna stampa', 'comunicati.html']],
        'Eventi e attività': [['Iniziative del coordinamento', 'eventi.html']]
    };
    // Una sola gerarchia: macroaree, senza duplicare voci dell'archivio editoriale.
    const FILTERS = [
        ['', 'Tutte'], ['aprilia', 'Aprilia'], ['regione_lazio', 'Lazio'],
        ['italia', 'Italia'], ['europa', 'Europa'], ['udc', 'UDC']
    ];
    const FILTER_AREAS = {
        aprilia: ['Città di Aprilia'], regione_lazio: ['Regione Lazio'],
        italia: ['Italia · notizie nazionali', 'Istituzioni italiane'],
        europa: ['Europa e Unione europea'], udc: ['UDC Aprilia', 'UDC nazionale', 'UDC Lazio', 'UDC Latina e provincia']
    };
    const categories = Object.values(LABELS);
    const MAIN_AREAS = ['UDC Aprilia', 'Città di Aprilia', 'Regione Lazio', 'Italia · notizie nazionali', 'Europa e Unione europea', 'UDC nazionale', 'UDC Lazio', 'UDC Latina e provincia'];
    const areaOf = category => category.startsWith('UDC ') ? 'UDC' :
        category === 'Città di Aprilia' ? 'Aprilia' : category === 'Regione Lazio' ? 'Lazio' :
            category === 'Europa e Unione europea' ? 'Europa' : 'Italia';
    root.innerHTML = `<div class="udc-news-toolbar">
    <div class="udc-news-heading"><span class="udc-news-eyebrow">OSSERVATORIO · FONTI VERIFICABILI</span><p>Le notizie, senza rumore.</p></div>
    <div class="udc-news-buttons" role="group" aria-label="Controlli notizie">
      <button id="udc-news-prev" type="button" aria-label="Notizia precedente" title="Notizia precedente">‹</button>
      <button id="udc-news-play" type="button" aria-label="Metti in pausa" title="Metti in pausa">Ⅱ</button>
      <button id="udc-news-next" type="button" aria-label="Notizia successiva" title="Notizia successiva">›</button></div></div>
    <div class="udc-news-filters" role="group" aria-label="Seleziona l'area delle notizie">
      ${FILTERS.map(([id, name]) => `<button class="udc-news-category${id === '' ? ' is-active' : ''}" type="button" data-category="${id}" aria-pressed="${id === ''}">${name}</button>`).join('')}
    </div>
    <div class="udc-news-display"><div id="udc-news-track" class="udc-news-track" role="region" aria-roledescription="carosello" aria-label="Notizia selezionata" aria-live="off"></div>
      <div class="udc-news-aside"><span class="udc-news-aside-kicker">INFORMAZIONE TRASPARENTE</span><h3>Direttamente dalle fonti.</h3><p>Gli articoli esterni si aprono in una nuova scheda. Per tornare qui, chiudi quella scheda oppure seleziona UDC Aprilia in alto. Le notizie esterne non sono comunicati UDC.</p><a href="https://www.comune.aprilia.lt.it/" target="_blank" rel="noopener noreferrer" class="udc-news-municipality">Portale del Comune di Aprilia <span aria-hidden="true">↗</span></a><a href="index.html" class="udc-news-municipality udc-news-back">← Torna alla home</a><div class="udc-news-aside-foot"><span class="udc-news-counter" id="udc-news-counter">—</span><span>Selezione di notizie e fonti</span></div></div>
    </div>
    <p id="udc-news-status" class="udc-news-status" role="status">Caricamento notizie…</p>
    <p id="udc-news-meta" class="udc-news-meta"></p>`;
    const track = root.querySelector('#udc-news-track');
    const status = root.querySelector('#udc-news-status');
    const meta = root.querySelector('#udc-news-meta');
    const play = root.querySelector('#udc-news-play');
    const prev = root.querySelector('#udc-news-prev');
    const next = root.querySelector('#udc-news-next');
    const buttons = [...root.querySelectorAll('button.udc-news-category')];
    const counter = root.querySelector('#udc-news-counter');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = reduced.matches, timer = null, hover = false, focus = false;
    let allNews = [], selected = '', visible = [], position = 0, updated = '';
    // Collegamenti diretti a filtri nell'Osservatorio, utilizzabili da altre pagine.
    const requested = new URLSearchParams(window.location.search).get('area');
    if (FILTER_AREAS[requested])
        selected = requested;
    function shuffle(items) {
        const arr = items.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function mixed(items) {
        // Mescola le categorie a giri, evitando lunghi blocchi della stessa area.
        const buckets = new Map();
        // Cinque macroaree equilibrate: UDC non prevale solo perché possiede quattro sottocategorie.
        for (const item of items) {
            const area = areaOf(item.category);
            if (!buckets.has(area))
                buckets.set(area, []);
            if (buckets.get(area).length < 24)
                buckets.get(area).push(item);
        }
        for (const [key, arr] of buckets)
            buckets.set(key, shuffle(arr));
        const result = [];
        let keys = shuffle([...buckets.keys()]);
        while (keys.length) {
            keys = shuffle(keys);
            for (const key of keys) {
                const item = buckets.get(key).shift();
                if (item)
                    result.push(item);
            }
            keys = keys.filter(key => buckets.get(key).length);
        }
        return result;
    }
    function card(item) {
        const href = safeUrl(item.href, true);
        if (!href)
            return '';
        const isSource = item.origin === 'source';
        const aggregator = item.linkKind === 'aggregatore' || /^https:\/\/news\.google\.com\//i.test(href);
        const external = /^https?:/.test(href);
        const attr = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<article class="udc-news-card${isSource ? ' udc-news-card-source' : ''}">
      <div class="udc-news-card-head"><span class="udc-news-label">${esc(item.category)}</span>
      <span class="udc-news-date">${isSource ? 'Portale della fonte' : esc(formatDate(item.date))}</span></div>
      <div class="udc-news-card-body"><span class="udc-news-card-overline">${isSource ? 'COLLEGAMENTO ISTITUZIONALE' : 'NOTIZIA DAL WEB'}</span>
      <h3><a href="${esc(href)}"${attr}>${esc(item.title)}</a></h3>
      <p class="udc-news-source">${isSource ? 'Vai alla fonte. Questo è un collegamento, non un nuovo articolo.' : 'Fonte: ' + esc(item.source || 'fonte identificata') + (aggregator ? ' · Collegamento tramite Google News' : ' · Collegamento diretto')}</p></div>
      <a class="udc-news-read" href="${esc(href)}"${attr} aria-label="${isSource ? 'Consulta la fonte originale' : 'Leggi la notizia completa'}${external ? ' (nuova scheda)' : ''}">${isSource ? 'Visita il sito originale' : 'Leggi la notizia completa'} <span aria-hidden="true">↗</span></a>${external ? '<p class="udc-news-tab-note">Si apre in una nuova scheda. Chiudila per tornare all’Osservatorio UDC Aprilia.</p>' : '<a class="udc-news-return" href="index.html">← Torna alla home</a>'}</article>`;
    }
    function sync() {
        clearInterval(timer);
        timer = null;
        const canMove = visible.length > 1;
        play.disabled = prev.disabled = next.disabled = !canMove;
        play.textContent = paused ? '▶' : 'Ⅱ';
        play.setAttribute('aria-label', paused ? 'Riprendi' : 'Metti in pausa');
        play.title = play.getAttribute('aria-label');
        if (canMove && !paused && !hover && !focus && !document.hidden)
            timer = setInterval(() => step(1), 5800);
    }
    function step(direction) {
        if (visible.length < 2)
            return;
        position = (position + direction + visible.length) % visible.length;
        showCurrent();
    }
    function showCurrent() {
        [...track.children].forEach((node, i) => {
            const active = i === position;
            node.hidden = !active;
            node.setAttribute('aria-hidden', String(!active));
            node.querySelectorAll('a').forEach(a => { a.tabIndex = active ? 0 : -1; });
        });
        counter.textContent = visible.length ? `${position + 1} / ${visible.length}` : '0 / 0';
    }
    function render() {
        buttons.forEach(button => {
            const current = button.dataset.category === selected;
            button.classList.toggle('is-active', current);
            button.setAttribute('aria-pressed', String(current));
        });
        visible = selected
            ? allNews.filter(item => (FILTER_AREAS[selected] || []).includes(item.category)).sort((a, b) => String(b.date).localeCompare(String(a.date)))
            : mixed(allNews);
        const count = visible.length;
        if (!count) {
            const areas = selected ? (FILTER_AREAS[selected] || []) : categories;
            const suggestions = areas.flatMap(name => (LINKS[name] || []).map(([title, href]) => ({ title, href })))
                .filter(item => safeUrl(item.href, true)).slice(0, 5);
            track.innerHTML = `<div class="udc-news-empty"><h3>Nessun articolo disponibile per questa area</h3>
      <p>Non mostriamo collegamenti generici come se fossero notizie. Puoi consultare direttamente le fonti indicate qui sotto.</p>
      <div class="udc-news-empty-links">${suggestions.map(item => `<a href="${esc(safeUrl(item.href, true))}"${/^https?:/.test(item.href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(item.title)} ↗</a>`).join('')}</div></div>`;
            counter.textContent = '0 / 0';
            status.textContent = 'Nessuna notizia effettivamente disponibile per la selezione. I collegamenti sopra sono fonti da consultare, non articoli.';
        }
        else {
            track.innerHTML = visible.map(card).join('');
            position = 0;
            showCurrent();
            status.textContent = `${count} ${count === 1 ? 'articolo disponibile' : 'articoli disponibili'} · ogni articolo conduce alla pubblicazione originale, in una nuova scheda.`;
        }
        requestAnimationFrame(sync);
    }
    buttons.forEach(button => button.addEventListener('click', () => {
        selected = button.dataset.category;
        // URL condivisibile e coerente con il filtro selezionato, senza ricaricare la pagina.
        const u = new URL(location.href);
        if (selected)
            u.searchParams.set('area', selected);
        else
            u.searchParams.delete('area');
        if (location.protocol === 'https:' || location.protocol === 'http:') {
            history.replaceState(null, '', u.pathname + u.search + u.hash);
        }
        render();
    }));
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    play.addEventListener('click', () => { paused = !paused; sync(); });
    track.addEventListener('pointerenter', () => { hover = true; sync(); });
    track.addEventListener('pointerleave', () => { hover = false; sync(); });
    track.addEventListener('focusin', () => { focus = true; sync(); });
    track.addEventListener('focusout', event => { if (!track.contains(event.relatedTarget)) {
        focus = false;
        sync();
    } });
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', e => { paused = e.matches; sync(); });
    let feed = { items: [] };
    try {
        feed = await loadJson('web-news.json', 'webNews');
    }
    catch (e) {
        console.warn('Feed non disponibile', e);
    }
    const webNews = (Array.isArray(feed.items) ? feed.items : []).filter(item => LABELS[item.priority] && item.title && item.url && item.date)
        .map(item => ({ title: item.title, href: item.url, date: item.date, source: item.source, category: LABELS[item.priority], origin: 'web', linkKind: item.link_kind || 'diretto' }));
    let press = [];
    try {
        press = await loadJson('stampa.json', 'stampa');
    }
    catch (err) {
        console.warn('Archivio stampa non disponibile', err);
    }
    const editorial = (Array.isArray(press) ? press : [])
        .filter(item => item.titolo && item.link && /^\d{4}-\d{2}-\d{2}$/.test(item.data || ''))
        .map(item => ({ title: item.titolo, href: item.link, date: item.data, source: item.fonte || 'Rassegna stampa', category: 'UDC Aprilia', origin: 'redazione', linkKind: 'diretto' }))
        .filter(item => { const age = Math.floor((Date.now() - Date.parse(item.date + 'T12:00:00Z')) / 86400000); return age >= -1 && age <= 95; });
    allNews = uniqueNews([...webNews, ...editorial]).slice(0, 160);
    updated = String(feed.updated_at || '').slice(0, 10);
    const freshDate = updated ? Date.parse(updated + 'T12:00:00Z') : 0;
    const daysOld = freshDate ? Math.floor((Date.now() - freshDate) / 86400000) : null;
    const freshness = !updated ? 'Catalogo iniziale: primo aggiornamento automatico da attivare in GitHub Actions.' :
        daysOld > 2 ? `Ultimo feed del ${formatDate(updated)}: verifica il workflow GitHub Actions.` :
            `Feed aggiornato il ${formatDate(updated)}.`;
    meta.textContent = `${freshness} Sono mostrati titolo, data e fonte, senza riprodurre gli articoli. I collegamenti Google News possono transitare dall’aggregatore. Raccolta prevista ogni sei ore se il workflow è attivo.`;
    render();
};
