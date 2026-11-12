/* Scorrimento Home: fonti esterne attribuite e contenuti redazionali separati. */
window.UDC_initHomeNews = async function ({stampa = [], eventi = []} = {}) {
  const root = document.getElementById('udc-news-widget');
  if (!root) return;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const valid = v => { try {const u = new URL(v);return u.protocol === 'https:' ? u.href : null;} catch {return null;} };
  const date = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? new Date(d+'T12:00:00').toLocaleDateString('it-IT', {day:'numeric',month:'short',year:'numeric'}) : '';
  let web = [];
  let generated = '';
  try { const response = await fetch('data/web-news.json', {cache:'no-store'}); if(response.ok){const payload = await response.json();web = Array.isArray(payload.items) ? payload.items : []; generated=payload.updated_at || '';}} catch(e){ console.warn('Feed web non disponibile, uso le notizie redazionali',e); }
  const items = [
    ...stampa.map(x => ({title:x.titolo,date:x.data,source:x.fonte,href:x.link,description:x.testo,category:'Rassegna stampa',priority:2,origin:'redazione'})),
    ...eventi.filter(x=>x.link).map(x => ({title:x.titolo,date:x.data,source:x.luogo || 'UDC Aprilia',href:x.link,description:x.descrizione,category:'Eventi e attività',priority:2,origin:'redazione'})),
    ...web.map(x => ({title:x.title,date:x.date,source:x.source,href:x.url,description:'',category:x.category || 'Notizie dal territorio',priority:x.priority === 'udc' ? 3 : 1,origin:'web'}))
  ].filter(x => x.title && valid(x.href));
  // Deduplica tramite URL e titolo, preferendo i link diretti curati dalla redazione.
  const seenUrls = new Set(), seenTitles = new Set();
  const unique = items.filter(x=>{const norm=x.title.toLowerCase().replace(/[^a-z0-9à-ÿ]+/g,' ').trim();const key=valid(x.href).split('?')[0].replace(/\/$/,'');if(seenUrls.has(key)||seenTitles.has(norm))return false;seenUrls.add(key);seenTitles.add(norm);return true;});
  const isUdc = x => /\budc\b|unione di centro|pietro fazio|ilaria cavallin|cristina picci/i.test(x.title+' '+x.description);
  const shuffle = a => {a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const udc = shuffle(unique.filter(isUdc));
  const local = shuffle(unique.filter(x=>!isUdc(x)));
  // Evidenza continua a UDC; le altre notizie restano riconoscibili e visibili.
  const ordered = [];
  while(udc.length || local.length){for(let k=0;k<3 && udc.length;k++)ordered.push(udc.shift());if(local.length)ordered.push(local.shift());}
  if(!ordered.length){root.innerHTML='<p class="note">Nessuna notizia disponibile al momento. Consulta le sezioni dedicate.</p>';return;}
  const cards=ordered.slice(0,40).map((x,i)=>`<article class="udc-news-card" data-news-index="${i}"><div class="udc-news-card-head"><span class="udc-news-label ${isUdc(x)?'udc-news-label-udc':''}">${isUdc(x)?'UDC Aprilia':esc(x.category)}</span><span class="udc-news-date">${esc(date(x.date))}</span></div><h3><a href="${esc(valid(x.href))}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a></h3><p class="udc-news-source">${x.origin==='web'?'Dal web · ':'Fonte · '}${esc(x.source || 'Testata esterna')}</p><a class="udc-news-read" href="${esc(valid(x.href))}" target="_blank" rel="noopener noreferrer">Apri la fonte originale ↗</a></article>`).join('');
  root.innerHTML = `<div class="udc-news-toolbar"><span class="udc-news-explainer">Articoli e iniziative · fonti esterne sempre indicate</span><div class="udc-news-buttons"><button type="button" id="udc-news-prev" aria-label="Notizie precedenti">‹</button><button type="button" id="udc-news-play" aria-label="Pausa scorrimento">Ⅱ</button><button type="button" id="udc-news-next" aria-label="Notizie successive">›</button></div></div><div id="udc-news-track" class="udc-news-track" tabindex="0" role="region" aria-label="Notizie ed eventi scorrevoli">${cards}</div><div class="udc-news-meta">${web.length ? 'Aggiornamento automatico del web attivo' : 'Notizie selezionate dalla redazione'}${generated?' · ultimo controllo: '+esc(date(generated.slice(0,10))):''}. I contenuti esterni non rappresentano comunicazioni ufficiali UDC.</div>`;
  const track=root.querySelector('#udc-news-track');
  const btn=root.querySelector('#udc-news-play');
  const cardWidth=()=> {const card=track.querySelector('.udc-news-card');return card ? card.getBoundingClientRect().width + 18 : 300;};
  const move=direction=>{let w=cardWidth(), p=track.scrollLeft, max=track.scrollWidth-track.clientWidth;if(max<5)return;const next= direction>0 && p>=max-15 ? 0 : direction<0 && p<15 ? max : Math.max(0,Math.min(max,p+direction*w));track.scrollTo({left:next,behavior:'smooth'});};
  let paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer;
  const sync=()=> {btn.textContent=paused?'▶':'Ⅱ';btn.setAttribute('aria-label',paused?'Riprendi scorrimento':'Pausa scorrimento');clearInterval(timer);if(!paused && ordered.length>1)timer=setInterval(()=>{if(!document.hidden)move(1);},5800);};
  root.querySelector('#udc-news-prev').addEventListener('click',()=>move(-1));
  root.querySelector('#udc-news-next').addEventListener('click',()=>move(1));
  btn.addEventListener('click',()=>{paused=!paused;sync();});
  track.addEventListener('pointerenter',()=>clearInterval(timer));
  track.addEventListener('pointerleave',sync);
  track.addEventListener('focusin',()=>clearInterval(timer));
  track.addEventListener('focusout',e=>{if(!track.contains(e.relatedTarget))sync();});
  sync();
};
