/* UDC Aprilia: notizie RSS selezionate, distinte dalla rassegna curata localmente. */
window.UDC_initHomeNews = async function ({stampa = [], eventi = []} = {}) {
  const root = document.getElementById('udc-news-widget');
  if (!root) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const https = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
  const dateLabel = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? new Date(`${value}T12:00:00`).toLocaleDateString('it-IT', {day:'numeric',month:'short',year:'numeric'}) : '';
  const labels = ['Tutte', 'Europa e NATO', 'UDC nazionale', 'UDC Regione Lazio', 'UDC Aprilia', 'Comune di Aprilia'];
  let web = [], updated = '';
  try {
    const response = await fetch('data/web-news.json', {cache:'no-store'});
    if (response.ok) {
      const payload = await response.json();
      web = Array.isArray(payload.items) ? payload.items : [];
      updated = payload.updated_at || '';
    }
  } catch (error) { console.warn('Catalogo RSS temporaneamente non disponibile', error); }
  const local = stampa.map(x => ({title:x.titolo, date:x.data, source:x.fonte, href:x.link, category:'UDC Aprilia', priority:11, origin:'redazione', via:'diretta'}));
  const activities = eventi.filter(x => x.link).map(x => ({title:x.titolo, date:x.data, source:x.luogo || 'UDC Aprilia', href:x.link, category:'UDC Aprilia', priority:10, origin:'redazione', via:'diretta'}));
  const fromWeb = web.map(x => ({title:x.title, date:x.date, source:x.source, href:x.url, category:x.category || 'Politica nazionale', priority:Number(x.priority) || 1, origin:'web', via:x.via || 'Google News'}));
  const seenLinks = new Set(), seenTitles = new Set();
  const combined = [...local, ...activities, ...fromWeb].filter(x => x.title && https(x.href)).filter(x => {
    const titleKey = String(x.title).toLocaleLowerCase('it').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
    const linkKey = https(x.href).split('?')[0].replace(/\/$/, '');
    if (seenLinks.has(linkKey) || seenTitles.has(titleKey)) return false;
    seenLinks.add(linkKey); seenTitles.add(titleKey); return true;
  });
  const group = x => {
    const cat = String(x.category || '').toLocaleLowerCase('it');
    const title = String(x.title || '').toLocaleLowerCase('it');
    if (cat === 'comune di aprilia') return 'Comune di Aprilia';
    if (cat === 'udc aprilia' || cat === 'pietro fazio') return 'UDC Aprilia';
    if (cat === 'lorenzo cesa' || cat === 'antonio de poli') return 'UDC nazionale';
    if (cat === 'europa e nato') return 'Europa e NATO';
    if (cat === 'udc regione lazio') return 'UDC Regione Lazio';
    if (cat === 'regione lazio' && /\budc\b|unione di centro/.test(title)) return 'UDC Regione Lazio';
    if (cat === 'udc nazionale' || cat === 'udc e dirigenti nazionali' || cat === 'antonio de poli') return 'UDC nazionale';
    // Compatibilità con il catalogo precedente, senza etichettare come UDC notizie generiche.
    if (/\bpietro fazio\b/.test(title)) return 'UDC Aprilia';
    if (/\blorenzo cesa\b|\bantonio de poli\b/.test(title)) return 'UDC nazionale';
    if (/\budc\b/.test(title) && /\baprilia\b/.test(title)) return 'UDC Aprilia';
    if (/\budc\b/.test(title) && /\blazio\b/.test(title)) return 'UDC Regione Lazio';
    if (/\budc\b|\bantonio de poli\b/.test(title)) return 'UDC nazionale';
    return null; // Evita di attribuire contenuti generici a un organismo politico.
  };
  const shuffled = array => { const copy = [...array]; for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy; };
  const categoryOrder = labels.slice(1);
  const ordered = categoryOrder.flatMap(category => shuffled(combined.filter(x => group(x) === category)));
  // I contenuti sono raggruppati nell’ordine dei filtri, con rotazione casuale entro ogni categoria.
  if (!ordered.length) {
    root.innerHTML = '<p class="note">Al momento non sono disponibili titoli aggiornati. Consulta <a href="https://www.comune.aprilia.lt.it/" target="_blank" rel="noopener noreferrer">il portale ufficiale del Comune di Aprilia</a>, <a href="comunicati.html">i comunicati UDC</a> e <a href="eventi.html">le iniziative locali</a>.</p>';
    return;
  }
  const options = labels.map((label,i) => `<button type="button" class="udc-news-filter" data-group="${esc(label)}" aria-pressed="${i===0?'true':'false'}">${esc(label)}</button>`).join('');
  root.innerHTML = `<nav class="udc-news-official-links" aria-label="Fonti ufficiali Aprilia"><strong>Fonti istituzionali:</strong> <a href="https://www.comune.aprilia.lt.it/" target="_blank" rel="noopener noreferrer">Portale ufficiale Comune di Aprilia ↗</a> <a href="https://www.comune.aprilia.lt.it/tipi-di-notizia/comunicati" target="_blank" rel="noopener noreferrer">Comunicati del Comune ↗</a> <a href="https://www.comune.aprilia.lt.it/tipi-di-notizia/avvisi" target="_blank" rel="noopener noreferrer">Avvisi ↗</a></nav><div class="udc-news-filters" role="group" aria-label="Filtra notizie per argomento">${options}</div><div class="udc-news-toolbar"><span class="udc-news-explainer">Titoli e link alle fonti · UDC nazionale: Segretario Antonio De Poli e Presidente Lorenzo Cesa</span><div class="udc-news-buttons"><button type="button" id="udc-news-prev" aria-label="Notizie precedenti">‹</button><button type="button" id="udc-news-play" aria-label="Pausa scorrimento">Ⅱ</button><button type="button" id="udc-news-next" aria-label="Notizie successive">›</button></div></div><div id="udc-news-track" class="udc-news-track" tabindex="0" role="region" aria-label="Notizie scorrevoli"></div><div id="udc-news-meta" class="udc-news-meta"></div>`;
  const track = root.querySelector('#udc-news-track');
  const meta = root.querySelector('#udc-news-meta');
  const play = root.querySelector('#udc-news-play');
  let active = 'Tutte', paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches, timer;
  function render() {
    const list = ordered.filter(x => active === 'Tutte' || group(x) === active).slice(0,60);
    track.innerHTML = list.map(x => {
      const href = esc(https(x.href));
      const intermediary = x.via === 'Google News';
      return `<article class="udc-news-card"><div class="udc-news-card-head"><span class="udc-news-label ${['UDC Aprilia','UDC nazionale','UDC Regione Lazio'].includes(group(x))?'udc-news-label-udc':''}">${esc(x.category === 'Pietro Fazio' ? 'UDC Aprilia · Pietro Fazio' : x.category === 'Lorenzo Cesa' ? 'UDC nazionale · Lorenzo Cesa' : x.category === 'Antonio De Poli' ? 'UDC nazionale · Antonio De Poli' : x.category)}</span><time class="udc-news-date" datetime="${esc(x.date || '')}">${esc(dateLabel(x.date))}</time></div><h3><a href="${href}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a></h3><p class="udc-news-source">${x.origin==='web'?'Fonte esterna':'Rassegna selezionata'} · ${esc(x.source || 'Fonte non specificata')}</p><a class="udc-news-read" href="${href}" target="_blank" rel="noopener noreferrer">${intermediary?'Apri tramite Google News':'Leggi sulla fonte originale'} ↗</a></article>`;
    }).join('') || '<p class="note">Nessuna notizia disponibile per questa categoria.</p>';
    track.scrollLeft = 0;
    const refreshed = updated ? ` · Ultimo controllo: ${esc(dateLabel(updated.slice(0,10)))}` : '';
    meta.textContent = `${list.length} notizie visualizzate${refreshed}. Notizie del Comune di Aprilia e fonti giornalistiche sono distinte dai comunicati ufficiali UDC. I link di Google News sono intermedi. I contenuti esterni sono selezionati automaticamente e non rappresentano necessariamente posizioni dell’UDC.`;
    root.querySelectorAll('.udc-news-filter').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.group === active)));
    sync();
  }
  function move(direction) {
    const card = track.querySelector('.udc-news-card');
    if (!card) return;
    const width = card.getBoundingClientRect().width + 18;
    const max = track.scrollWidth - track.clientWidth;
    if (max < 5) return;
    const pos = track.scrollLeft;
    track.scrollTo({left:direction > 0 && pos >= max - 15 ? 0 : direction < 0 && pos < 15 ? max : Math.max(0,Math.min(max,pos + direction * width)),behavior:'smooth'});
  }
  function sync() {
    clearInterval(timer);
    play.textContent = paused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', paused ? 'Riprendi scorrimento' : 'Pausa scorrimento');
    if (!paused && track.querySelectorAll('.udc-news-card').length > 1) timer=setInterval(()=>{if(!document.hidden)move(1);},5800);
  }
  root.querySelectorAll('.udc-news-filter').forEach(button => button.addEventListener('click',()=>{active=button.dataset.group;render();}));
  root.querySelector('#udc-news-prev').addEventListener('click',()=>move(-1));
  root.querySelector('#udc-news-next').addEventListener('click',()=>move(1));
  play.addEventListener('click',()=>{paused=!paused;sync();});
  track.addEventListener('pointerenter',()=>clearInterval(timer));
  track.addEventListener('pointerleave',sync);
  track.addEventListener('focusin',()=>clearInterval(timer));
  track.addEventListener('focusout',event=>{if(!track.contains(event.relatedTarget))sync();});
  render();
};
