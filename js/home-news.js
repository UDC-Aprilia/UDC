/**
 * Rassegna notizie della Home.
 * Le categorie e i comandi sono sempre visibili, anche senza articoli.
 * I dati editoriali restano separati dalle notizie esterne automatiche.
 */
window.UDC_initHomeNews = async function ({ stampa = [], eventi = [] } = {}) {
  const root = document.getElementById('udc-news-widget');
  if (!root) return;

  const utils = window.UDCUtils;
  const { escapeHtml: escape, safeUrl, formatDate, uniqueNews } = utils;
  const CATEGORIES = Object.freeze({
    udc_aprilia: 'UDC Aprilia',
    comune_aprilia: 'Comune di Aprilia',
    regione_lazio: 'Regione Lazio',
    udc_nazionale: 'UDC nazionale · Cesa e De Poli',
    istituzioni: 'Istituzioni italiane',
    europa: 'Europa e Unione europea'
  });
  const EDITORIAL_CATEGORIES = ['Rassegna stampa', 'Eventi e attività'];
  const categoryNames = [...Object.values(CATEGORIES), ...EDITORIAL_CATEGORIES];
  const fileMode = location.protocol === 'file:';

  // Renderizza subito i controlli, prima di qualsiasi caricamento asincrono.
  root.innerHTML = `
    <div class="udc-news-toolbar">
      <span class="udc-news-explainer">Notizie e attività · fonti originali indicate</span>
      <div class="udc-news-buttons" role="group" aria-label="Controlli notizie">
        <button type="button" id="udc-news-prev" aria-label="Notizia precedente" title="Notizia precedente">‹</button>
        <button type="button" id="udc-news-play" aria-label="Metti in pausa" title="Metti in pausa">Ⅱ</button>
        <button type="button" id="udc-news-next" aria-label="Notizia successiva" title="Notizia successiva">›</button>
      </div>
    </div>
    <div class="udc-news-filters" role="group" aria-label="Seleziona le notizie per categoria">
      <button class="udc-news-category is-active" type="button" data-category="" aria-pressed="true">Tutte</button>
      ${categoryNames.map(category => `<button class="udc-news-category" type="button" data-category="${escape(category)}" aria-pressed="false">${escape(category)}</button>`).join('')}
    </div>
    <div id="udc-news-track" class="udc-news-track" tabindex="0" role="region" aria-label="Notizie scorrevoli"></div>
    <p id="udc-news-status" class="udc-news-status" role="status">Caricamento delle notizie…</p>
    <p id="udc-news-meta" class="udc-news-meta"></p>
  `;

  const track = root.querySelector('#udc-news-track');
  const status = root.querySelector('#udc-news-status');
  const meta = root.querySelector('#udc-news-meta');
  const play = root.querySelector('#udc-news-play');
  const prev = root.querySelector('#udc-news-prev');
  const next = root.querySelector('#udc-news-next');
  const filters = [...root.querySelectorAll('.udc-news-category')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let timer = null;
  let selectedCategory = '';
  let ordered = [];
  let external = [];
  let lastUpdate = '';

  function alternateByCategory(all) {
    const buckets = new Map();
    for (const item of all) {
      if (!buckets.has(item.category)) buckets.set(item.category, []);
      buckets.get(item.category).push(item);
    }
    for (const bucket of buckets.values()) {
      bucket.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    }
    const result = [];
    while ([...buckets.values()].some(bucket => bucket.length)) {
      for (const bucket of buckets.values()) {
        if (bucket.length) result.push(bucket.shift());
      }
    }
    return result;
  }

  function cardHtml(item) {
    const href = safeUrl(item.href);
    return `<article class="udc-news-card">
      <div class="udc-news-card-head">
        <span class="udc-news-label ${item.category === CATEGORIES.udc_aprilia ? 'udc-news-label-udc' : ''}">${escape(item.category)}</span>
        <span class="udc-news-date">${escape(formatDate(item.date))}</span>
      </div>
      <h3><a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(item.title)}</a></h3>
      <p class="udc-news-source">${item.origin === 'web' ? 'Dal web' : 'Fonte'} · ${escape(item.source || 'Fonte esterna')}</p>
      <a class="udc-news-read" href="${escape(href)}" target="_blank" rel="noopener noreferrer">Apri la fonte originale ↗</a>
    </article>`;
  }

  function visibleCards() {
    return [...track.querySelectorAll('.udc-news-card:not([hidden])')];
  }

  function step(direction) {
    const visible = visibleCards();
    if (visible.length < 2) return;
    const itemWidth = visible[0].getBoundingClientRect().width + 18;
    const end = Math.max(0, track.scrollWidth - track.clientWidth);
    if (end < 5) return;
    const current = track.scrollLeft;
    const target = direction > 0 && current >= end - 15 ? 0
      : direction < 0 && current < 15 ? end
      : Math.max(0, Math.min(end, current + direction * itemWidth));
    track.scrollTo({ left: target, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  function syncTimer() {
    clearInterval(timer);
    play.textContent = paused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', paused ? 'Riprendi scorrimento' : 'Metti in pausa');
    play.title = play.getAttribute('aria-label');
    const canScroll = visibleCards().length > 1 && track.scrollWidth > track.clientWidth + 5;
    prev.disabled = !canScroll;
    next.disabled = !canScroll;
    play.disabled = !canScroll;
    if (!paused && !document.hidden && canScroll) {
      timer = setInterval(() => step(1), 5800);
    }
  }

  function applyFilter() {
    filters.forEach(button => {
      const active = button.dataset.category === selectedCategory;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    [...track.children].forEach((card, index) => {
      card.hidden = Boolean(selectedCategory && ordered[index].category !== selectedCategory);
    });
    const count = visibleCards().length;
    status.textContent = count ? `${count} ${count === 1 ? 'notizia disponibile' : 'notizie disponibili'}${selectedCategory ? ' per ' + selectedCategory : ''}.`
      : `Nessuna notizia disponibile al momento${selectedCategory ? ' per ' + selectedCategory : ''}. Puoi scegliere un’altra categoria.`;
    status.hidden = false;
    track.scrollLeft = 0;
    // Dimensioni aggiornate dopo l’applicazione degli attributi hidden.
    requestAnimationFrame(syncTimer);
  }

  filters.forEach(button => button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    applyFilter();
  }));
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  play.addEventListener('click', () => { paused = !paused; syncTimer(); });
  track.addEventListener('pointerenter', () => clearInterval(timer));
  track.addEventListener('pointerleave', syncTimer);
  track.addEventListener('focusin', () => clearInterval(timer));
  track.addEventListener('focusout', event => {
    if (!track.contains(event.relatedTarget)) syncTimer();
  });
  document.addEventListener('visibilitychange', syncTimer);
  reducedMotion.addEventListener('change', event => {
    paused = event.matches;
    syncTimer();
  });

  try {
    const catalog = await utils.loadJson('web-news.json', 'webNews');
    external = Array.isArray(catalog.items) ? catalog.items : [];
    lastUpdate = String(catalog.updated_at || '').slice(0, 10);
  } catch (error) {
    console.warn('Notizie esterne non disponibili.', error);
  }

  const editorial = [
    ...stampa.map(item => ({
      title: item.titolo, date: item.data, source: item.fonte,
      href: item.link, category: 'Rassegna stampa', origin: 'redazione'
    })),
    ...eventi.filter(item => item.link).map(item => ({
      title: item.titolo, date: item.data, source: item.luogo || 'UDC Aprilia',
      href: item.link, category: 'Eventi e attività', origin: 'redazione'
    }))
  ];
  const automatic = external.map(item => ({
    title: item.title, date: item.date, source: item.source,
    href: item.url, category: CATEGORIES[item.priority] || item.category || 'Altre notizie',
    origin: 'web'
  }));

  ordered = alternateByCategory(uniqueNews([...editorial, ...automatic])).slice(0, 60);
  track.innerHTML = ordered.map(cardHtml).join('');
  meta.textContent = `${external.length ? 'Notizie automatiche disponibili' : 'Notizie automatiche non ancora disponibili'}${lastUpdate ? ' · Ultimo aggiornamento: ' + formatDate(lastUpdate) : ''}. Le notizie esterne non costituiscono comunicati ufficiali UDC.${fileMode ? ' Anteprima locale: per ricevere nuove notizie pubblica il sito e avvia GitHub Actions.' : ''}`;
  applyFilter();
};
