/** Carosello: Tutte mescola le aree; ogni filtro mostra esclusivamente la sua categoria. */
window.UDC_initHomeNews = async function ({ stampa = [], eventi = [] } = {}) {
  const root = document.getElementById('udc-news-widget');
  if (!root) return;
  const { escapeHtml: esc, safeUrl, formatDate, uniqueNews, loadJson } = window.UDCUtils;
  const LABELS = Object.freeze({
    udc_aprilia: 'UDC Aprilia', aprilia: 'Città di Aprilia', regione_lazio: 'Regione Lazio',
    italia: 'Italia · notizie nazionali', udc_nazionale: 'UDC nazionale',
    istituzioni: 'Istituzioni italiane', europa: 'Europa e Unione europea'
  });
  const LINKS = {
    'UDC Aprilia': [['Comunicati UDC Aprilia', 'archivio-comunicati.html']],
    'Città di Aprilia': [['Notizie del Comune di Aprilia', 'https://www.comune.aprilia.lt.it/tipi-di-notizia/notizie'], ['Avvisi pubblici del Comune', 'https://www.comune.aprilia.lt.it/tipi-di-notizia/avvisi']],
    'Regione Lazio': [['Notizie della Regione Lazio', 'https://www.regione.lazio.it/notizie']],
    'Italia · notizie nazionali': [['Notizie della Presidenza del Consiglio', 'https://www.governo.it/']],
    'UDC nazionale': [['Sito ufficiale UDC nazionale', 'https://www.udc-italia.it/']],
    'Istituzioni italiane': [['Attività del Parlamento italiano', 'https://www.parlamento.it/']],
    'Europa e Unione europea': [['Notizie del Parlamento europeo', 'https://www.europarl.europa.eu/news/it'], ['Notizie della Commissione europea', 'https://commission.europa.eu/news-and-media_it']],
    'Rassegna stampa': [['Archivio rassegna stampa', 'comunicati.html']],
    'Eventi e attività': [['Iniziative del coordinamento', 'eventi.html']]
  };
  const categories = [...Object.values(LABELS), 'Rassegna stampa', 'Eventi e attività'];
  root.innerHTML = `<div class="udc-news-toolbar"><span class="udc-news-explainer">Notizie dal web · fonti originali consultabili</span>
    <div class="udc-news-buttons" role="group" aria-label="Controlli scorrimento">
      <button id="udc-news-prev" type="button" aria-label="Precedente" title="Precedente">‹</button>
      <button id="udc-news-play" type="button" aria-label="Pausa" title="Pausa">Ⅱ</button>
      <button id="udc-news-next" type="button" aria-label="Successiva" title="Successiva">›</button></div></div>
    <div class="udc-news-filters" role="group" aria-label="Filtra notizie per area">
      <button class="udc-news-category is-active" type="button" data-category="" aria-pressed="true">Tutte</button>
      ${categories.map(name => `<button class="udc-news-category" type="button" data-category="${esc(name)}" aria-pressed="false">${esc(name)}</button>`).join('')}
      <a class="udc-news-category udc-news-external" href="https://www.comune.aprilia.lt.it/" target="_blank" rel="noopener noreferrer" title="Sito istituzionale, avvisi e Albo Pretorio">Sito del Comune ↗</a>
    </div><div id="udc-news-track" class="udc-news-track" tabindex="0" role="region" aria-label="Articoli in scorrimento"></div>
    <p id="udc-news-status" class="udc-news-status" role="status">Caricamento notizie…</p>
    <p id="udc-news-meta" class="udc-news-meta"></p>`;
  const track = root.querySelector('#udc-news-track');
  const status = root.querySelector('#udc-news-status');
  const meta = root.querySelector('#udc-news-meta');
  const play = root.querySelector('#udc-news-play');
  const prev = root.querySelector('#udc-news-prev');
  const next = root.querySelector('#udc-news-next');
  const buttons = [...root.querySelectorAll('button.udc-news-category')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, timer = null, hover = false, focus = false;
  let allNews = [], selected = '', visible = [], position = 0, updated = '';

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
    for (const item of items) {
      if (!buckets.has(item.category)) buckets.set(item.category, []);
      buckets.get(item.category).push(item);
    }
    for (const [key, arr] of buckets) buckets.set(key, shuffle(arr));
    const result = [];
    let keys = shuffle([...buckets.keys()]);
    while (keys.length) {
      keys = shuffle(keys);
      for (const key of keys) {
        const item = buckets.get(key).shift();
        if (item) result.push(item);
      }
      keys = keys.filter(key => buckets.get(key).length);
    }
    return result;
  }
  function card(item) {
    const href = safeUrl(item.href, true);
    if (!href) return '';
    const isSource = item.origin === 'source';
    const external = /^https?:/.test(href);
    const attr = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<article class="udc-news-card${isSource ? ' udc-news-card-source' : ''}">
      <div class="udc-news-card-head"><span class="udc-news-label">${esc(item.category)}</span>
      <span class="udc-news-date">${isSource ? 'Fonte ufficiale' : esc(formatDate(item.date))}</span></div>
      <h3><a href="${esc(href)}"${attr}>${esc(item.title)}</a></h3>
      <p class="udc-news-source">${isSource ? 'Collegamento, non un articolo' : 'Fonte: ' + esc(item.source || 'Fonte esterna')}</p>
      <a class="udc-news-read" href="${esc(href)}"${attr}>${isSource ? 'Consulta la fonte ↗' : 'Leggi la notizia originale ↗'}</a></article>`;
  }
  function sync() {
    clearInterval(timer); timer = null;
    const canMove = visible.length > 1;
    play.disabled = prev.disabled = next.disabled = !canMove;
    play.textContent = paused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', paused ? 'Riprendi' : 'Metti in pausa');
    play.title = play.getAttribute('aria-label');
    if (canMove && !paused && !hover && !focus && !document.hidden) timer = setInterval(() => step(1), 5800);
  }
  function step(direction) {
    if (visible.length < 2) return;
    position = (position + direction + visible.length) % visible.length;
    const target = track.children[position];
    if (target) track.scrollTo({ left: target.offsetLeft - track.children[0].offsetLeft, behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  function render() {
    buttons.forEach(button => {
      const current = button.dataset.category === selected;
      button.classList.toggle('is-active', current);
      button.setAttribute('aria-pressed', String(current));
    });
    visible = selected ? allNews.filter(item => item.category === selected).sort((a,b) => String(b.date).localeCompare(String(a.date))) : mixed(allNews);
    const count = visible.length;
    if (!count) {
      const categoriesWithFallback = selected ? [selected] : categories.filter(name => LINKS[name]);
      visible = categoriesWithFallback.flatMap(name => (LINKS[name] || []).map(([title, href]) => ({title, href, category:name, origin:'source'})));
    }
    track.innerHTML = visible.map(card).join('');
    position = 0;
    track.scrollLeft = 0;
    status.textContent = count ? `${count} ${count === 1 ? 'notizia' : 'notizie'} ${selected ? 'per ' + selected : 'da tutte le categorie'} · clicca sul titolo per aprire la fonte.`
      : `Nessuna notizia web aggiornata${selected ? ' per ' + selected : ''}: sono disponibili i collegamenti diretti alle fonti, non articoli.`;
    requestAnimationFrame(sync);
  }
  buttons.forEach(button => button.addEventListener('click', () => { selected = button.dataset.category; render(); }));
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  play.addEventListener('click', () => { paused = !paused; sync(); });
  track.addEventListener('pointerenter', () => { hover = true; sync(); });
  track.addEventListener('pointerleave', () => { hover = false; sync(); });
  track.addEventListener('focusin', () => { focus = true; sync(); });
  track.addEventListener('focusout', event => { if (!track.contains(event.relatedTarget)) { focus = false; sync(); } });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', e => { paused = e.matches; sync(); });

  let feed = {items: []};
  try { feed = await loadJson('web-news.json', 'webNews'); } catch (e) { console.warn('Feed non disponibile', e); }
  const webNews = (Array.isArray(feed.items) ? feed.items : []).filter(item => LABELS[item.priority] && item.title && item.url && item.date)
    .map(item => ({ title:item.title, href:item.url, date:item.date, source:item.source, category:LABELS[item.priority], origin:'web' }));
  const editorial = [
    ...stampa.map(item => ({title:item.titolo, href:item.link, date:item.data, source:item.fonte, category:'Rassegna stampa', origin:'redazione'})),
    ...eventi.filter(item => item.link).map(item => ({title:item.titolo, href:item.link, date:item.data, source:item.luogo || 'UDC Aprilia', category:'Eventi e attività', origin:'redazione'}))
  ];
  allNews = uniqueNews([...webNews, ...editorial]).slice(0, 140);
  updated = String(feed.updated_at || '').slice(0,10);
  meta.textContent = `${updated ? 'Feed aggiornato il ' + formatDate(updated) + ' · ' : ''}Notizie esterne selezionate da fonti identificabili; non rappresentano comunicati ufficiali UDC. Aggiornamento automatico tramite GitHub Actions ogni 6 ore (se attivo).`;
  render();
};
