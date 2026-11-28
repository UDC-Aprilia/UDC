/* Layout condiviso: NON occorre duplicare il menu e il footer nelle pagine. */
(async () => {
    'use strict';
    const d = window.UDC;
    const page = document.body.dataset.page || 'home';
    const asset = f => f.startsWith('pubblicazioni/foto/') ? 'pubblicazioni/foto/' + encodeURIComponent(f.slice('pubblicazioni/foto/'.length)) : `assets/${encodeURIComponent(f)}`;
    const escape = window.UDCUtils.escapeHtml;
    // Sette voci principali, con sottomenu HTML semantici e navigabili da tastiera.
    const groups = [
        { label: 'Home', href: 'index.html', pages: ['home'] },
        { label: 'Chi siamo', href: 'missione.html', pages: ['missione', 'organi', 'consiglio', 'tesseramento'], children: [['Missione', 'missione.html'], ['Direzione e direttivo', 'organi.html'], ['Consiglio generale', 'consiglio-generale.html'], ['Tesseramento', 'tesseramento.html']] },
        { label: 'Attività UDC', href: 'rete-udc.html', pages: ['rete'] },
        { label: 'Programma 2027', href: 'programma.html', pages: ['programma'] },
        { label: 'Notizie ed eventi', href: 'notizie.html', pages: ['notizie', 'eventi', 'comunicati', 'galleria'], children: [['Osservatorio notizie', 'notizie.html'], ['Eventi e attività', 'eventi.html'], ['Rassegna stampa', 'comunicati.html'], ['Galleria fotografica', 'foto.html']] },
        { label: 'Cultura', href: 'cultura.html', pages: ['cultura'] },
        { label: 'Documenti', href: 'archivio-comunicati.html', pages: ['documenti', 'lettere', 'collegamenti'], children: [['Comunicati ufficiali', 'archivio-comunicati.html'], ['Lettere ed esiti istituzionali', 'archivio-lettere.html'], ['Rete territoriale', 'collegamenti.html']] },
        { label: 'Contatti', href: 'contatti.html', pages: ['contatti'] }
    ];
    const nav = groups.map(group => {
        const active = group.pages.includes(page);
        const link = `<a href="${group.href}"${active ? ' class="active" aria-current="location"' : ''}>${group.label}</a>`;
        return group.children ? `<details class="nav-group"${active ? ' data-active="true"' : ''}><summary>${group.label}<span aria-hidden="true">⌄</span></summary><div class="nav-submenu">${group.children.map(([label, href]) => `<a href="${href}"${location.pathname.endsWith('/' + href) ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</div></details>` : link;
    }).join('');
    const header = `<style>
#global-search{box-sizing:border-box;max-width:94vw;overscroll-behavior:contain}
#global-search button{position:static!important;inset:auto!important;transform:none!important;float:none!important;width:auto!important;height:auto!important;min-height:44px;max-width:100%;white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important;display:inline-flex!important;align-items:center;justify-content:center;padding:10px 16px!important;border:1px solid #b6c4d7;border-radius:6px;background:#102b50;color:white;font:inherit;font-weight:600;cursor:pointer}
#global-search form{display:block!important;position:static!important;width:100%;margin:0}
#global-search #global-search-form button[type=submit],#global-search #global-results>button{width:100%!important;margin:10px 0}
#global-search select{max-width:100%;min-height:40px;padding:6px;border:1px solid #aab8c9;border-radius:6px;background:white;color:#102b50;font:inherit}
#global-search input{box-sizing:border-box;font:inherit}
#global-search #global-results{min-width:0;overflow-wrap:anywhere}
.header .global-search-toggle:focus:not(:focus-visible){outline:none}
@media(max-width:1160px){.header .global-search-toggle,.header .toggle{box-sizing:border-box;width:44px;height:44px;min-width:44px;max-width:44px}.header .global-search-toggle:focus-visible,.header .toggle:focus-visible{outline-offset:-3px}}
@media(max-width:600px){#global-search{padding:16px!important;max-height:85dvh!important}#global-search #global-search-form>div{display:grid!important;grid-template-columns:1fr 1fr;gap:8px!important}#global-search #global-search-form>div label{display:flex;flex-direction:column;min-width:0;font-size:.85rem}#global-search #global-search-form>div label:last-child{grid-column:1/-1}}
</style><style>
.header .global-search-toggle{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:none;min-height:44px;padding:0 10px;background:#fff;color:#102b50;border:1px solid #b6c4d7;border-radius:6px;cursor:pointer;font:inherit;font-size:.8rem}
.header .global-search-toggle svg{flex:none;display:block}
.header .global-search-toggle:focus-visible,.header .toggle:focus-visible{outline:3px solid #2484cf;outline-offset:3px}
@media(min-width:1161px){.header .header-inner{gap:clamp(8px,1vw,16px)}}
@media(max-width:1160px){
.header .header-inner{display:grid;grid-template-columns:minmax(0,1fr) 44px 44px;align-items:center;gap:8px;min-height:0;padding:10px 0}
.header .brand{min-width:0;margin:0;gap:8px}
.header .brand img{width:clamp(36px,10vw,54px);height:clamp(36px,10vw,54px);flex:none}
.header .brand span{min-width:0}
.header .brand strong{font-size:clamp(1rem,4.5vw,1.45rem);line-height:1.1}
.header .brand small{font-size:clamp(.55rem,2vw,.7rem);letter-spacing:.025em;line-height:1.25;margin-top:4px}
.header .global-search-toggle,.header .toggle{width:44px;height:44px;min-height:44px;padding:0;border-radius:6px;display:flex;align-items:center;justify-content:center}
.header .global-search-label{display:none}
.header .menu{grid-column:1/-1;min-width:0}
}
</style><a class="skip" href="#contenuto">Vai al contenuto</a><div class="topline"></div><div class="utility"><div class="container">Unione dei Democratici Cristiani e di Centro · Aprilia</div></div><header class="header"><div class="container header-inner"><a class="brand" href="index.html"><img src="assets/logo.png" alt="Logo UDC Aprilia"><span><strong>UDC Aprilia</strong><small>Coordinamento comunale</small></span></a><button type="button" data-global-search aria-label="Cerca nel sito" title="Cerca nel sito" class="global-search-toggle"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg><span class="global-search-label">Cerca</span></button><button type="button" class="toggle" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu">☰</button><nav id="menu" class="menu" aria-label="Navigazione principale">${nav}<a class="national" href="${d.nazionale}" target="_blank" rel="noopener noreferrer">UDC nazionale ↗</a></nav></div></header>`;
    // Un solo collegamento a Cultura nel footer. Eliminati i link ripetuti.
    const footer = `<footer class="footer"><div class="container"><div class="foot-grid"><div><div class="logo-foot"><span class="logo-foot-disc"><img src="assets/logo.png" alt="Logo UDC Aprilia"></span><div><h3>UDC Aprilia</h3><p>Unione dei Democratici Cristiani e di Centro<br>Coordinamento comunale di Aprilia</p></div></div></div><div><h3>Il coordinamento</h3><div class="foot-list"><a href="missione.html">Missione</a><a href="programma.html">Programma 2027–2032</a><a href="cultura.html">Cultura e libri</a><a href="organi.html">Direzione e direttivo</a><a href="rete-udc.html">Attività UDC</a><a href="consiglio-generale.html">Consiglio generale</a><a href="tesseramento.html">Tesseramento</a><a href="contatti.html">Contatti</a></div></div><div><h3>Informazione e documenti</h3><div class="foot-list"><a href="notizie.html">Osservatorio notizie</a><a href="eventi.html">Eventi</a><a href="comunicati.html">Rassegna stampa</a><a href="archivio-comunicati.html">Comunicati ufficiali</a><a href="archivio-lettere.html">Lettere ed esiti istituzionali</a><a href="foto.html">Archivio fotografico</a><a href="collegamenti.html">Rete territoriale</a><a href="${d.nazionale}" target="_blank" rel="noopener noreferrer">UDC nazionale ↗</a></div></div></div><div class="footer-bottom">© <span id="anno"></span> UDC Aprilia · Sito informativo del coordinamento territoriale. <a href="privacy.html">Privacy</a></div></div></footer>`;
    const heading = (title, description) => `<div class="page-head"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / ${escape(title)}</div><h1>${escape(title)}</h1><p>${escape(description)}</p></div></div>`;
    // Un solo catalogo e un solo componente grafico per tutti gli organi.
    const profiles = window.UDCPubblicazioni?.profili || [];
    const profilePath = (person, file, version) =>
        `pubblicazioni/profili/${encodeURIComponent(person.id)}/${encodeURIComponent(file)}${version ? `?v=${encodeURIComponent(version)}` : ""}`;

    const profileContent = person => {
        const blocks = (person.testo || '').split(/\r?\n\s*\r?\n/).filter(Boolean);
        const introduction = blocks[0]?.startsWith('## ') ? '' : (blocks.shift() || '');
        const details = blocks.map(block => {
            if (block.startsWith('## ')) {
                const [heading, ...lines] = block.split(/\r?\n/);
                return `<h4>${escape(heading.slice(3))}</h4>${lines.length ? `<p>${escape(lines.join(' '))}</p>` : ''}`;
            }
            return `<p>${escape(block)}</p>`;
        }).join('');
        const attachments = person.allegati.map(row => {
            const title = row.file === 'curriculum.pdf' ? 'Curriculum completo (PDF)' : `${row.titolo} (${row.immagine ? 'immagine' : 'PDF'})`;
            return `<li><a href="${escape(profilePath(person, row.file, row.versione))}" target="_blank" rel="noopener noreferrer">${escape(title)}</a></li>`;
        }).join('');
        const contact = person.contatto
            ? `<p class="coordinator-contact"><a href="mailto:${escape(person.contatto)}">${escape(person.contatto)}</a></p>`
            : '';
        if (!introduction && !details && !attachments && !contact) return '';
        return `<section class="coordinator-bio" aria-label="Profilo di ${escape(person.nome)}">
            ${introduction ? `<p>${escape(introduction)}</p>` : ''}
            ${details || attachments ? `<details><summary>Curriculum e approfondimenti</summary>${details}${attachments ? `<ul>${attachments}</ul>` : ''}</details>` : ''}
            ${contact}
        </section>`;
    };

    const people = (arr, empty = 'La composizione sarà comunicata attraverso i canali ufficiali del coordinamento.') => {
        if (!arr.length) return `<div class="empty">${escape(empty)}</div>`;
        const cards = arr.map(person => {
            const portrait = person.foto
                ? `<img src="${escape(profilePath(person, person.foto, person.foto_versione))}" alt="Ritratto di ${escape(person.nome)}" loading="lazy" decoding="async">`
                : '<div class="portrait-placeholder" aria-hidden="true">Foto</div>';
            return `<article class="card profile">
                <div class="portrait-ring">${portrait}</div>
                <div class="card-content">
                    <h3>${escape(person.nome)}</h3>
                    <p>${escape(person.incarico)}</p>${person.data_nomina ? `<p class="meta">Nomina: ${escape(person.data_nomina)}</p>` : ''}${person.data_fine ? `<p class="meta">Fine incarico: ${escape(person.data_fine)}</p>` : ''}
                    ${person.coordinamento && (person.direttivo || person.consiglio) ? `<p class="profile-memberships">${[person.direttivo ? "Direttivo" : "", person.consiglio ? "Consiglio generale" : ""].filter(Boolean).join(" · ")}</p>` : ""}
                    ${profileContent(person)}
                </div>
            </article>`;
        }).join('');
        return `<div class="grid profile-grid">${cards}</div>`;
    };
    const today = new Date().toISOString().slice(0,10);
    const activeProfiles = profiles.filter(p => !p.data_fine || p.data_fine >= today);
    const formerProfiles = profiles.filter(p => p.data_fine && p.data_fine < today);
    const leadership = activeProfiles.filter(person => person.coordinamento);
    // Una persona con più incarichi non compare due volte nella stessa pagina.
    const directors = activeProfiles.filter(person => person.direttivo && !person.coordinamento);
    const council = activeProfiles.filter(person => person.consiglio && !person.coordinamento);
    const safeUrl = value => { try {
        const raw = String(value ?? '').trim();
        if (!raw) return '';
        const url = new URL(raw, location.href);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    }
    catch {
        return '';
    } };
    // Le due sezioni condividono il catalogo generato dalle cartelle approvate.
    const program = window.UDCPubblicazioni?.programma || null;
    const programUrl = program
        ? `pubblicazioni/programma/${encodeURIComponent(program.file)}?v=${encodeURIComponent(program.versione)}`
        : '';
    const books = window.UDCPubblicazioni?.cultura || [];
    const bookCards = items => items.length ? items.map(book => {
        const cover = book.copertina
            ? `<figure class="libro-immagine">
                <img src="pubblicazioni/cultura/${encodeURIComponent(book.id)}/${encodeURIComponent(book.copertina)}?v=${encodeURIComponent(book.versione)}" alt="Copertina di ${escape(book.titolo)}" loading="lazy" decoding="async">
                <figcaption>Copertina del libro</figcaption>
               </figure>`
            : `<div class="libro-cover" aria-hidden="true"><span>Biblioteca delle idee</span><strong>${escape(book.titolo)}</strong><small>${escape(book.autori)}</small></div>`;
        const info = [book.editore, book.anno, book.isbn ? `ISBN ${book.isbn}` : ''].filter(Boolean);
        // Solo collegamenti HTTPS assoluti, anche se il catalogo venisse modificato a mano.
        const bookLink = (url, label) => typeof url === 'string' && url.startsWith('https://') && safeUrl(url)
            ? `<a class="text-link" href="${escape(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`
            : '';
        return `<article class="libro-card">
            ${cover}
            <div class="libro-info">
                ${book.tema ? `<span class="kicker">${escape(book.tema)}</span>` : ''}
                <h3>${escape(book.titolo)}</h3>
                ${book.sottotitolo ? `<p class="libro-subtitle">${escape(book.sottotitolo)}</p>` : ''}
                <p class="libro-autori">${escape(book.autori)}</p>
                ${book.descrizione ? `<p>${escape(book.descrizione)}</p>` : ''}
                ${info.length ? `<p class="libro-dati">${escape(info.join(' · '))}</p>` : ''}
                ${book.nota ? `<p class="libro-nota">${escape(book.nota)}</p>` : ''}
                <div class="libro-links">
                    ${bookLink(book.link_editore, 'Consulta la scheda dell’editore')}
                    ${book.link_pubblicazione !== book.link_editore ? bookLink(book.link_pubblicazione, 'Consulta la pubblicazione o la ricerca') : ''}
                </div>
                ${book.nota_link ? `<p class="libro-link-note">${escape(book.nota_link)}</p>` : ''}
            </div>
        </article>`;
    }).join('') : '<p class="note">Il catalogo non contiene ancora pubblicazioni.</p>';

    const programPublished = () => `
        ${heading('Programma amministrativo 2027–2032', 'Consulta il documento programmatico disponibile per la pubblicazione.')}
        <section class="prog2027-hero" aria-labelledby="prog2027-title">
            <div class="container prog2027-grid">
                <div>
                    <span class="prog2027-kicker">UDC APRILIA · AMMINISTRATIVE 2027</span>
                    <h2 id="prog2027-title">Il programma 2027–2032</h2>
                    <p class="prog2027-intro">Consulta il testo integrale nella versione PDF pubblicata. Il documento costituisce la fonte di riferimento per i contenuti di questa pagina.</p>
                    <div class="prog2027-status" role="status">
                        <span class="prog2027-status-dot" aria-hidden="true"></span>
                        <div><strong>Documento disponibile</strong><span>Versione corrente in formato PDF.</span></div>
                    </div>
                    <div class="prog2027-actions">
                        <a href="${escape(programUrl)}" class="prog2027-primary" target="_blank" rel="noopener noreferrer">Leggi il programma (PDF) ↗</a>
                        <a href="${escape(programUrl)}" class="prog2027-secondary" download>Scarica il PDF</a>
                    </div>
                </div>
                <aside class="prog2027-side" aria-label="Informazioni sul documento">
                    <img src="assets/logo.png" alt="Emblema UDC Aprilia" class="prog2027-logo">
                    <span class="prog2027-side-caption">DOCUMENTI PROGRAMMATICI</span>
                    <strong class="prog2027-bigyear">2027<span>—</span>2032</strong>
                    <div class="prog2027-side-rule"></div>
                    <p>Il PDF contiene il testo di riferimento. Eventuali aggiornamenti sostituiscono la versione precedente.</p>
                    <span class="prog2027-side-foot">COORDINAMENTO COMUNALE · APRILIA</span>
                </aside>
            </div>
        </section>
        <section class="section section-white prog2027-process">
            <div class="container">
                <h2>Consultazione del documento</h2>
                <p class="section-lead">Per la data e gli estremi di approvazione fare riferimento al PDF. L’eventuale programma elettorale depositato seguirà le procedure previste dalla normativa applicabile.</p>
            </div>
        </section>`;

    const prettyDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? new Date(value + 'T12:00:00').toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }) : String(value || '');
    const eventId = e => e.id === 'evento-2026-11-18-pomezia' ? 'incontro-pomezia-2026' : String(e.id || '');
    const eventPhoto = e => e.foto && /^[a-zA-Z0-9_.-]+$/.test(e.foto) ? asset(e.foto) : '';
    const eventFeature = e => {
        const photo = eventPhoto(e), source = safeUrl(e.link);
        return `<section class="incontro-event-page" id="${escape(eventId(e))}" aria-labelledby="incontro-event-title"><div class="container"><div class="incontro-event-grid"${photo ? '' : ' style="grid-template-columns:1fr"'}><div class="incontro-event-copy"><span class="incontro-event-tag">IN PRIMO PIANO · ${escape(prettyDate(e.data))}</span><h2 id="incontro-event-title">${escape(e.titolo)}</h2><div class="incontro-event-facts"><div><span>Data</span><strong>${escape(prettyDate(e.data))}</strong></div><div><span>Luogo</span><strong>${escape(e.luogo || 'Aprilia')}</strong></div></div><p style="white-space:pre-line">${escape(e.descrizione || '')}</p>${source ? `<a class="incontro-button" href="${escape(source)}" target="_blank" rel="noopener noreferrer">Leggi la fonte ↗</a>` : ''}</div>${photo ? `<a class="incontro-event-art" href="${escape(photo)}" target="_blank" rel="noopener noreferrer" aria-label="Apri immagine originale"><img src="${escape(photo)}" alt="${escape(e.titolo)}" loading="eager"></a>` : ''}</div></div></section>`;
    };
    const eventCards = arr => arr.length ? `<div class="grid two">${arr.map(e => `<article class="card" id="${escape(eventId(e))}">${e.foto && /^[a-zA-Z0-9_.-]+$/.test(e.foto) ? `<img class="card-img" src="${asset(e.foto)}" alt="${escape(e.titolo)}" loading="lazy">` : ''}<div class="card-content"><div class="meta">${escape(prettyDate(e.data))} · ${escape(e.luogo || 'Aprilia')} · ${e.tipo === 'organizzato' ? 'Organizzato da UDC Aprilia' : 'Partecipazione / iniziativa seguita'}</div><h3>${escape(e.titolo)}</h3><p style="white-space:pre-line">${escape(e.descrizione)}</p>${safeUrl(e.link) ? `<a class="text-link" href="${escape(safeUrl(e.link))}" target="_blank" rel="noopener noreferrer">Leggi la fonte ↗</a>` : eventPhoto(e) ? `<a class="text-link" href="${escape(eventPhoto(e))}" target="_blank" rel="noopener noreferrer">${e.id === 'evento-2026-11-18-pomezia' ? 'Leggi la locandina' : 'Apri immagine originale'} ↗</a>` : ''}</div></article>`).join('')}</div>` : '<p class="note">Non ci sono attività pubblicate.</p>';
    // La pagina Rassegna stampa mostra solo gli articoli pertinenti a Fazio / UDC Aprilia.
    const pressRelevant = item => {
        const title = String(item.titolo || '');
        return /\bpietro\s+fazio\b|\budc\b.{0,65}\baprilia\b|\baprilia\b.{0,65}\budc\b|\bfazio\b.{0,90}\baprilia\b|\baprilia\b.{0,90}\bfazio\b/i.test(title);
    };
    const pressCards = arr => arr.length ? `<div class="grid two">${arr.map(c => `<article class="card" data-date="${escape(c.data || '')}" data-title="${escape(c.titolo || '')}" data-author="${escape(c.autore || '')}" data-source="${escape(c.fonte || '')}" data-topic="${escape((c.argomento || c.testo || ''))}"><div class="card-content"><div class="meta">${escape(prettyDate(c.data))} · ${escape(c.fonte || 'Testata')}${c.tipo_link === 'aggregatore' ? ' · collegamento Google News' : ''}</div><h3>${escape(c.titolo)}</h3>${c.autore ? `<p class="press-author">Di ${escape(c.autore)}</p>` : ''}<p>${escape(c.testo || '')}</p>${safeUrl(c.link) ? `<a class="text-link" href="${escape(safeUrl(c.link))}" target="_blank" rel="noopener noreferrer">Leggi l'articolo sulla testata ↗</a>` : ''}</div></article>`).join('')}</div>` : '<p class="note">Nessun articolo inserito nella rassegna stampa.</p>';
    // Scorrimento editoriale: tutti gli articoli restano accessibili nell'archivio statico sottostante.
    const pressTicker = arr => {
        const ordered = [...arr].sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
        if (!ordered.length)
            return '';
        const cards = ordered.slice(0, 18).map(c => {
            const url = safeUrl(c.link);
            return `<article class="press-flow-item"><span class="press-flow-meta">${escape(prettyDate(c.data))} · ${escape(c.fonte || 'Fonte esterna')}${c.tipo_link === 'aggregatore' ? ' · Google News' : ''}</span><h3>${url ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(c.titolo)}</a>` : escape(c.titolo)}</h3><span class="press-flow-label">${c.origine === 'ricerca_rss' ? 'Segnalazione automatica · verificare sulla testata' : 'Rassegna stampa'}</span></article>`;
        }).join('');
        return `<section class="press-flow" aria-label="Articoli recenti in scorrimento"><div class="press-flow-heading"><div><span class="kicker">IN EVIDENZA · FONTI ESTERNE</span><h2>La stampa, in movimento.</h2><p>Articoli su Pietro Fazio e UDC Aprilia. Lo scorrimento si ferma al passaggio del mouse o quando si seleziona un articolo.</p></div><button class="press-flow-toggle" type="button" aria-pressed="false" aria-label="Metti in pausa lo scorrimento">Ⅱ Pausa</button></div><div class="press-flow-window" tabindex="0" aria-label="Scorri gli articoli con il mouse, il dito o la tastiera"><div class="press-flow-track">${cards}</div></div><p class="press-flow-hint">Una selezione di articoli recenti. Per consultare e cercare tutte le pubblicazioni, apri l’archivio storico.</p></section>`;
    };
    // Pubblicazione deliberata: i dati privati NON devono essere inseriti nel JSON pubblico.
    // Ricezione, protocollazione, riscontro e accoglimento sono eventi distinti.
    const statoInvioLabel = {
        'inviata': 'Inviata', 'consegnata': 'PEC consegnata', 'protocollata': 'Protocollata',
        'risposta-ricevuta': 'Riscontro ricevuto'
    };
    const esitoLabel = {
        'non-noto': 'Esito non comunicato', 'in-valutazione': 'In valutazione',
        'accolta': 'Richiesta accolta', 'parzialmente-accolta': 'Parzialmente accolta',
        'non-accolta': 'Non accolta', 'nessun-riscontro': 'Nessun riscontro documentato'
    };
    const safeDocumentName = name => typeof name === 'string' && /^[a-zA-Z0-9_.-]+\.(pdf|docx)$/i.test(name) ? name : '';
    const safePdfName = name => typeof name === 'string' && /^[a-zA-Z0-9_.-]+\.pdf$/i.test(name) ? name : '';
    const letterDetail = x => {
        const year = String(x.anno);
        const parts = [];
        for(const [label,value] of [['Materia',x.materia],['Fascicolo',x.fascicolo],['Data trasmissione',x.data_trasmissione],['Esito',x.esito_testo]]) if(value) parts.push('<p><strong>'+label+':</strong> '+escape(value)+'</p>');
        if(x.collegata_a){const related=(d.lettere||[]).find(y=>(y.id||'lettera-'+y.anno+'-'+y.file)===x.collegata_a && y.pubblica===true && y.verifica_privacy===true && /^20\d{2}$/.test(String(y.anno)) && safeDocumentName(y.file));if(related) parts.push('<p><a class="text-link" href="'+escape('lettere/'+related.anno+'/'+encodeURIComponent(related.file))+'">Documento collegato: '+escape(related.titolo)+'</a></p>');}
        if (x.iniziativa)
            parts.push(`<p><strong>Iniziativa del coordinamento:</strong> ${escape(x.iniziativa)}</p>`);
        if (x.modalita_invio)
            parts.push(`<p><strong>Modalità di trasmissione:</strong> ${escape(x.modalita_invio)}</p>`);
        if (statoInvioLabel[x.stato_invio] || ['ricevuta','attesa','conclusa'].includes(x.stato_invio))
            parts.push(`<p><strong>Stato documentale:</strong> ${escape(statoInvioLabel[x.stato_invio] || ({ricevuta:'Ricevuta',attesa:'In attesa di risposta',conclusa:'Conclusa'})[x.stato_invio])}</p>`);
        if (x.data_consegna && x.stato_invio !== 'inviata')
            parts.push(`<p><strong>Consegna PEC:</strong> ${escape(prettyDate(x.data_consegna))} (se documentata)</p>`);
        if (x.protocollo)
            parts.push(`<p><strong>Protocollo comunicato dall'ente:</strong> ${escape(x.protocollo)}${x.data_protocollo ? ' del ' + escape(prettyDate(x.data_protocollo)) : ''}</p>`);
        if (x.data_risposta && x.stato_invio === 'risposta-ricevuta')
            parts.push(`<p><strong>Riscontro ricevuto:</strong> ${escape(prettyDate(x.data_risposta))}</p>`);
        if (x.sintesi_risposta && x.stato_invio === 'risposta-ricevuta')
            parts.push(`<p><strong>Sintesi del riscontro:</strong> ${escape(x.sintesi_risposta)}</p>`);
        if (esitoLabel[x.esito])
            parts.push(`<p><strong>Esito documentato:</strong> ${escape(esitoLabel[x.esito])}</p>`);
        if (x.nota_esito)
            parts.push(`<p><strong>Precisazioni:</strong> ${escape(x.nota_esito)}</p>`);
        const risposta = safePdfName(x.file_risposta);
        if (risposta && x.stato_invio === 'risposta-ricevuta' && x.risposta_pubblicabile === true && x.verifica_privacy_risposta === true) {
            parts.push(`<p><a class="text-link" href="${escape('lettere/' + year + '/' + encodeURIComponent(risposta))}" target="_blank" rel="noopener noreferrer">Consulta risposta pubblicabile (PDF) ↗</a></p>`);
        }
        else if (x.data_risposta) {
            parts.push('<p class="archive-small-note">Il riscontro integrale non è pubblicato; viene riportata solo la sintesi verificata.</p>');
        }
        return `<div class="letter-details">${parts.join('')}</div>`;
    };
    // Il catalogo è pubblico: pubblicare solo voci espressamente approvate e documenti verificati.
    const documentCards = (items, tipo = 'comunicato') => {
        const lettere = tipo === 'lettera';
        const label = lettere ? 'Lettere istituzionali' : 'Comunicati e documenti ufficiali';
        const categories = {comunicato:'Comunicato stampa',nomina:'Atto di nomina',delibera:'Delibera',documento:'Documento ufficiale'};
        const entries = (Array.isArray(items) ? items : []).filter(x => x && x.pubblica === true && x.verifica_privacy === true &&
            /^20\d{2}$/.test(String(x.anno || '')) &&
            safeDocumentName(x.file) && (!lettere || (x.direzione === 'entrata' ? typeof x.mittente === 'string' && x.mittente.trim() : typeof x.destinatario === 'string' && x.destinatario.trim())) &&
            typeof x.titolo === 'string' && x.titolo.trim() &&
            /^\d{4}-\d{2}-\d{2}$/.test(String(x.data || '')) &&
            String(x.data).slice(0, 4) === String(x.anno));
        const years = [...new Set(['2026', '2025', ...entries.map(x => String(x.anno))])].sort((a, b) => b.localeCompare(a));
        const folder = lettere ? 'lettere' : 'documenti';
        return (lettere ? '<div class="archive-filter"><label>Direzione <select id="letter-filter"><option value="">Tutte</option><option value="uscita">Inviate</option><option value="entrata">Ricevute</option><option value="legacy">Da classificare</option></select></label> <label>Cerca <input id="letter-search" type="search" placeholder="Oggetto, ente, materia, fascicolo"></label></div>' : '') + `<div class="archive-years">${years.map(year => {
            const ofYear = entries.filter(x => String(x.anno) === year).sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(a.titolo).localeCompare(String(b.titolo), 'it'));
            const mesi = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
            return `<section class="archive-year" aria-label="${label} ${escape(year)}"><h2>${label} ${escape(year)}</h2>${ofYear.length
                ? `<div class="archive-list">${ofYear.map((x, i) => `${i === 0 || x.data.slice(0, 7) !== ofYear[i - 1].data.slice(0, 7) ? `<h3 class="archive-month">${mesi[Number(x.data.slice(5, 7)) - 1]} ${year}</h3>` : ''}<article class="archive-doc${lettere ? ' archive-letter' : ''}" data-direction="${lettere ? escape(x.direzione || 'legacy') : ''}"><div><div class="meta">${escape(prettyDate(x.data))} · ${lettere ? (x.direzione === 'entrata' ? 'Lettera ricevuta' : x.direzione === 'uscita' ? 'Lettera inviata' : 'Corrispondenza istituzionale') : escape(categories[x.categoria] || categories.comunicato)}${lettere ? (x.direzione === 'entrata' ? ' · Mittente: ' + escape(x.mittente) : ' · Destinatario: ' + escape(x.destinatario)) : ''}</div><h3>${escape(x.titolo)}</h3>${x.descrizione ? `<p>${escape(x.descrizione)}</p>` : ''}${lettere ? letterDetail(x) : ''}</div>${`<div class="archive-pdf-actions">${[...new Set([x.file,x.file_alternativo].filter(safeDocumentName))].map(name=>`<a class="text-link" href="${escape(folder + '/' + year + '/' + encodeURIComponent(name))}" download="${escape(name)}">Scarica ${/\.pdf$/i.test(name)?'PDF':'Word (DOCX)'} ↓</a>`).join('')}</div>`}</article>`).join('')}</div>`
                : `<p class="note">Nessun${lettere ? 'a lettera istituzionale' : ' comunicato'} ${lettere ? 'pubblicata' : 'pubblicato'} per questo anno.</p>`}</section>`;
        }).join('')}</div>`;
    };
    const territorial = () => `<div class="links-grid">${d.linkTerritoriali.map(x => `<div class="territory"><div><span>${escape(x.ambito)}</span><strong>${escape(x.nome)}</strong></div>${x.url ? `<a class="text-link" href="${escape(x.url)}" ${x.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>Visita ↗</a>` : '<span class="muted">Link in aggiornamento</span>'}</div>`).join('')}</div>`;
    // Manifesto pubblico unico: aggiornato dalla pagina di gestione tramite GitHub API.
    // Il fallback conserva le fotografie preesistenti in caso di problemi di rete.
    try {
        const catalogo = await window.UDCUtils.loadJson('foto.json', 'foto');
        if (!Array.isArray(catalogo))
            throw new Error('Catalogo non valido');
        d.foto = catalogo;
    }
    catch (errore) {
        console.warn('Galleria: utilizzo archivio di riserva.', errore);
    }
    // Cataloghi editoriali: le fonti esterne sono inserite e approvate dal redattore.
    // L'acquisizione automatica non può verificare affidabilità, pertinenza o diritti.
    for (const [file, key, localKey] of [['stampa.json', 'comunicati', 'stampa'], ['attivita.json', 'eventi', 'attivita'], ['documenti.json', 'documenti', 'documenti'], ['lettere.json', 'lettere', 'lettere']]) {
        try {
            const catalogo = await window.UDCUtils.loadJson(file, localKey);
            if (!Array.isArray(catalogo))
                throw new Error('Catalogo non valido');
            d[key] = catalogo;
        }
        catch (error) {
            console.warn('Catalogo ' + file + ' non disponibile:', error);
            if (key === 'documenti' || key === 'lettere')
                d[key] = [];
        }
    }
    const uploads = window.UDCPubblicazioni || {};
    d.foto = [...(d.foto || []), ...(uploads.foto || []).filter(x => x.immagine).map(x => ({ ...x, file: 'pubblicazioni/foto/' + x.file }))];
    const uploadSection = (key, label, pdfOnly = false) => {
        const items = (uploads[key] || []).filter(x => !pdfOnly || !x.immagine);
        if (!items.length)
            return '';
        return `<section class="section section-white"><div class="container"><h2>${escape(label)}</h2><div class="grid two">${items.map(x => { const url = 'pubblicazioni/' + key + '/' + encodeURIComponent(x.file); return `<article class="card">${x.immagine ? `<a href="${escape(url)}" target="_blank" rel="noopener"><img class="card-img" src="${escape(url)}" alt="${escape(x.titolo)}" loading="lazy"></a>` : ''}<div class="card-content"><h3>${escape(x.titolo)}</h3>${x.data ? `<p>${escape(x.data)}</p>` : ''}<a class="text-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${x.immagine ? 'Apri immagine' : 'Apri PDF'} ↗</a></div></article>`; }).join('')}</div></div></section>`;
    };
    const extraUploads = { eventi: uploadSection('eventi', 'Documentazione degli eventi'), galleria: uploadSection('foto', 'Documenti fotografici PDF', true), lettere: uploadSection('lettere-inviate', 'Lettere inviate') + uploadSection('lettere-ricevute', 'Lettere ricevute'), documenti: uploadSection('comunicati', 'Comunicati – nuove pubblicazioni') };
    d.eventi.sort((a, b) => String(b.data).localeCompare(String(a.data)));
    d.comunicati.sort((a, b) => String(b.data).localeCompare(String(a.data)));
    const rassegnaCasuale = d.comunicati.length ? d.comunicati[Math.floor(Math.random() * d.comunicati.length)] : null;
    const eventoRecente = d.eventi[0] || null;
    // Una sola sorgente per la galleria e la Home: data/foto.json.
    const fotoArchivio = Array.isArray(d.foto) ? d.foto.filter(f => f && typeof f.file === 'string' && f.file.trim()) : [];
    const fotoCasuali = [...fotoArchivio];
    // Fisher-Yates: ordine nuovo ad ogni caricamento della pagina.
    for (let i = fotoCasuali.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fotoCasuali[i], fotoCasuali[j]] = [fotoCasuali[j], fotoCasuali[i]];
    }
    const fotoHome = fotoCasuali;
    const homeSlides = fotoHome.map((f, i) => `<div class="elite-slide${i === 0 ? ' active' : ''}" aria-hidden="${i !== 0}"><img ${i === 0 ? `src="${asset(f.file)}" fetchpriority="high"` : `data-src="${asset(f.file)}"`} alt="${escape(f.titolo || 'Fotografia UDC Aprilia')}" decoding="async"></div>`).join('');
    const homeDots = fotoHome.map((f, i) => `<button type="button"${i === 0 ? ' class="is-current" aria-current="true"' : ''} aria-label="Mostra foto ${i + 1}: ${escape(f.titolo || 'Fotografia UDC Aprilia')}"></button>`).join('');
    // La fascia dell'evento è visibile solo fino al giorno dell'appuntamento, in Italia.
    const todayItaly = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const displayPomeziaFeature = todayItaly <= '2026-11-18';
    const content = {
        home: `<section class="elite-hero editorial-hero" aria-labelledby="homepage-title"><div class="container elite-hero-grid"><div class="elite-copy"><div class="elite-overline"><span class="elite-mark"></span> UDC · APRILIA · COORDINAMENTO COMUNALE</div><h1 id="homepage-title">Il coordinamento<br><em>UDC Aprilia.</em></h1><p>Informazioni, iniziative e documenti del coordinamento comunale. Un punto di riferimento per seguire l'attività del partito sul territorio.</p><div class="elite-actions"><a class="btn btn-elite-primary" href="organi.html">Il coordinamento <span aria-hidden="true">↗</span></a><a class="btn btn-elite-quiet" href="eventi.html">Eventi e iniziative <span aria-hidden="true">→</span></a></div><div class="elite-caption-line">Unione dei Democratici Cristiani e di Centro <span>·</span> Aprilia</div></div><div class="elite-visual"><div class="elite-main-photo elite-slideshow" role="region" aria-roledescription="carosello" aria-label="Tutte le fotografie dell’archivio UDC Aprilia">${homeSlides || '<div class="elite-slide active"><img src="assets/nomina.jpg" alt="Incontro del coordinamento UDC Aprilia"></div>'}<div class="elite-slide-shade" aria-hidden="true"></div><div class="elite-slide-ui"><div class="elite-slide-text"><span class="elite-slide-kicker">ARCHIVIO FOTOGRAFICO</span><strong id="slide-caption">${escape(fotoHome[0]?.titolo || 'Il coordinamento sul territorio')}</strong><a class="elite-gallery-link" href="foto.html">Guarda tutte le fotografie →</a></div><div class="elite-slide-controls"><div class="elite-dots" aria-label="Seleziona fotografia">${homeDots}</div><button class="elite-playpause" type="button" aria-label="Metti in pausa la dissolvenza" title="Metti in pausa la dissolvenza">Ⅱ</button></div></div></div></div></div></section>${displayPomeziaFeature ? `<section class="incontro-feature compact-event" aria-labelledby="incontro-2026-title"><div class="container incontro-grid"><div class="incontro-text"><div class="incontro-kicker"><span class="incontro-marker" aria-hidden="true"></span> APPUNTAMENTO UDC · POMEZIA</div><p class="incontro-date"><time datetime="2026-11-18T18:00:00">18 NOVEMBRE 2026 · ORE 18:00</time></p><h2 id="incontro-2026-title">La politica dell’UDC: <em>i territori al centro</em></h2><p class="incontro-subtitle">Dalle nostre radici il futuro delle nuove generazioni</p><p class="incontro-description">Hotel Selene, Via Pontina Km 30, Pomezia. Informazioni e partecipanti sono disponibili nella scheda dell’evento.</p><div class="incontro-actions"><a class="incontro-button" href="eventi.html#incontro-pomezia-2026">Leggi i dettagli dell'evento <span aria-hidden="true">→</span></a></div></div><a class="incontro-poster" href="assets/evento-udc-pomezia-18-novembre-2026.jpg" target="_blank" rel="noopener noreferrer" aria-label="Apri la locandina originale dell'evento in una nuova scheda"><img src="assets/evento-udc-pomezia-18-novembre-2026.jpg" width="605" height="807" alt="Locandina ufficiale: La politica dell’UDC, i territori al centro, 18 novembre 2026, Hotel Selene Pomezia" loading="lazy"><span class="incontro-poster-hint">Apri la locandina originale ↗</span></a></div></section>` : ''}<section class="prog2027-home" aria-labelledby="prog2027-home-title"><div class="container prog2027-home-inner"><div><span class="prog2027-home-label">AMMINISTRATIVE 2027 · DOCUMENTI</span><h2 id="prog2027-home-title">Programma amministrativo 2027–2032</h2><p>${program ? 'Il documento programmatico è disponibile: consulta la versione corrente in PDF.' : 'La proposta è in fase di esame. Il documento ufficiale sarà pubblicato dopo l’approvazione del Consiglio Generale UDC Aprilia.'}</p></div><a href="programma.html" class="prog2027-home-link" aria-label="Vai alla pagina del programma amministrativo 2027–2032">${program ? 'Consulta il programma' : 'Segui il percorso'} <span aria-hidden="true">→</span></a></div></section><section class="home-quickpaths" aria-label="Percorsi principali"><div class="container home-quickpaths-grid"><a href="rete-udc.html" class="home-quickpath"><span>RETE UDC</span><strong>Aprilia, Latina, Lazio e nazionale</strong><small>Iniziative e documenti →</small></a><a href="cultura.html" class="home-quickpath"><span>APRILIA · CULTURA</span><strong>Identità e radici della città</strong><small>Luoghi, libri e memoria →</small></a><a href="programma.html" class="home-quickpath"><span>AMMINISTRATIVE 2027</span><strong>Il percorso del programma</strong><small>Documenti e stato dei lavori →</small></a></div></section><section class="section section-white editorial-news" aria-labelledby="news-title"><div class="container"><div class="editorial-heading"><div><span class="kicker">Informazione e territorio</span><h2 id="news-title">Le ultime <em>notizie.</em></h2></div><p>Le pubblicazioni più recenti, in ordine cronologico, con data, fonte e collegamento alla testata.</p></div><div id="udc-home-teasers" class="udc-home-teasers" aria-live="polite"><p class="note">Caricamento delle notizie in evidenza…</p></div><div class="udc-news-bottom"><span class="udc-news-bottom-label">ESPLORA</span><a class="text-link udc-news-all-link" href="notizie.html">Apri l'osservatorio: tutte le aree →</a><a class="text-link" href="eventi.html">Eventi →</a><a class="text-link" href="comunicati.html">Rassegna stampa →</a></div></div></section><section class="home-coordination-strip"><div class="container"><div><span class="kicker">Il coordinamento</span><h2>Organizzazione e responsabilità</h2><p>Scopri gli organi del coordinamento, i referenti e la documentazione comunale.</p></div><a class="text-link" href="organi.html">Conosci la struttura →</a></div></section><section class="editorial-membership" aria-labelledby="membership-title"><div class="container editorial-membership-inner"><div><span class="editorial-membership-kicker">Informazioni sul tesseramento</span><h2 id="membership-title">Modalità di adesione</h2><p>Consulta la documentazione ufficiale UDC e le istruzioni per concordare la consegna della domanda al coordinamento di Aprilia.</p></div><a href="tesseramento.html" class="btn editorial-membership-btn">Informazioni e modulistica <span aria-hidden="true">→</span></a></div></section>`,
        rete: `${heading('Attività UDC', 'Iniziative, appuntamenti e documenti: un percorso distinto dalla rassegna stampa.')}
    <section class="section section-white elite-editorial"><div class="container"><div class="elite-editorial-intro"><span class="kicker">ATTIVITÀ DOCUMENTATE</span><h2>Dal territorio alle istituzioni</h2><p>Qui sono raccolti gli appuntamenti e i riferimenti documentali disponibili. Gli articoli giornalistici sono consultabili esclusivamente nella Rassegna stampa, per evitare ripetizioni.</p></div><div class="elite-editorial-grid"><article class="elite-editorial-card"><span class="kicker">01 · TERRITORIO</span><h3>Incontri e iniziative</h3><p>Appuntamenti e attività pubblicati, con date e documentazione quando disponibili.</p><a class="text-link" href="eventi.html">Consulta gli eventi →</a></article><article class="elite-editorial-card"><span class="kicker">02 · DOCUMENTI</span><h3>Comunicazioni ufficiali</h3><p>Comunicati, lettere istituzionali e relativi documenti consultabili alla fonte.</p><a class="text-link" href="archivio-comunicati.html">Archivio comunicati →</a><a class="text-link" href="archivio-lettere.html">Lettere istituzionali →</a></article><article class="elite-editorial-card"><span class="kicker">03 · ORGANIZZAZIONE</span><h3>Struttura e collegamenti</h3><p>Organi del coordinamento e riferimenti alle strutture territoriali.</p><a class="text-link" href="organi.html">Direzione e direttivo →</a><a class="text-link" href="collegamenti.html">Rete territoriale →</a></article></div><div class="elite-editorial-related"><div><span class="kicker">PER APPROFONDIRE</span><h3>Notizie e fonti giornalistiche</h3><p>La rassegna stampa conserva gli articoli e offre la ricerca nell'archivio storico, senza duplicarli in questa pagina.</p></div><a class="btn btn-elite-primary" href="comunicati.html#archivio-stampa">Vai alla Rassegna stampa →</a></div></div></section>`,
        notizie: `${heading('Osservatorio notizie', 'Articoli da fonti identificate, consultabili per territorio e tema.')}<section class="section section-white editorial-news page-news-archive"><div class="container"><div class="archive-intro"><span class="kicker">Aprilia · Lazio · Italia · Europa · UDC</span><h2>Notizie e fonti, <em>con chiarezza.</em></h2><p>Seleziona una categoria per leggere soltanto gli articoli disponibili di quell'area. I portali istituzionali sono indicati separatamente: non vengono presentati come articoli. I collegamenti esterni si aprono in una nuova scheda.</p></div><div id="udc-news-widget" class="udc-news-widget" aria-live="off"><p class="note">Caricamento delle notizie…</p></div><div class="udc-news-bottom"><a class="text-link" href="index.html">← Torna alla home</a><a class="text-link" href="comunicati.html">Rassegna stampa UDC Aprilia →</a><a class="text-link" href="eventi.html">Eventi e iniziative →</a></div></div></section>`,
        cultura: `${heading('Cultura e libri', 'Libri, storia e riflessioni per conoscere Aprilia e la società che cambia.')}
<section class="radici-section" aria-labelledby="radici-title"><div class="container"><div class="radici-heading"><div class="radici-eyebrow"><span class="radici-rule" aria-hidden="true"></span> APRILIA · MEMORIA E FUTURO</div><h2 id="radici-title">Identità <em>e radici</em></h2><p class="radici-lead">I luoghi della nostra città raccontano la memoria condivisa e la cultura che costruisce il domani.</p></div><div class="radici-images"><figure class="radici-place radici-chiesa"><img src="assets/chiesa-san-michele-aprilia.webp" alt="Chiesa di San Michele Arcangelo ad Aprilia, con il campanile e la piazza" loading="lazy" decoding="async" width="916" height="1024"><figcaption><span class="radici-place-number">01 / MEMORIA</span><strong>San Michele Arcangelo</strong><span>La piazza, la storia, il senso di comunità</span></figcaption></figure><figure class="radici-place radici-biblioteca"><img src="assets/biblioteca-manzu-aprilia.webp" alt="Biblioteca comunale Giacomo Manzù ad Aprilia, vista esterna dell'edificio" loading="lazy" decoding="async" width="436" height="296"><figcaption><span class="radici-place-number">02 / CULTURA</span><strong>Biblioteca Giacomo Manzù</strong><span>Conoscenza, incontro e nuove generazioni</span></figcaption></figure></div><div class="radici-quote-wrap"><div class="radici-quote-kicker">DAL LIBRO <cite>PENSARE APRILIA</cite></div><blockquote class="radici-quote">«L’appartenenza passa da qui: dal riconoscere, nei luoghi della vita quotidiana, una città che sentiamo nostra.»</blockquote><div class="radici-attribution"><strong>Pietro Fazio</strong><span>Da <cite>Pensare Aprilia</cite>, capitolo 11 “Abitare Aprilia”, p. 37</span></div><a class="radici-link" href="cultura.html">Scopri i libri e gli autori <span aria-hidden="true">→</span></a></div></div></section><section class="section section-white cultura-section"><div class="container">
<div class="cultura-intro"><span class="kicker">Biblioteca delle idee</span><h2>Libri, memoria e futuro</h2><p class="section-lead">Una selezione di pubblicazioni per riflettere sulla storia della città, sulla costruzione di una comunità e sulle sfide delle nuove generazioni. Le schede hanno finalità culturale e informativa: le opere non rappresentano documenti o posizioni ufficiali dell’UDC Aprilia.</p></div>
<div class="libri-grid">${bookCards(books)}
</div><div class="cultura-bottom"><h2>Una biblioteca di comunità</h2><p>La cultura dà strumenti per conoscere la storia locale e discutere il futuro. Questa selezione può arricchirsi con altri autori, studi e iniziative culturali della città.</p><a class="text-link" href="cultura.html#radici-title">Torna a identità e radici ↑</a></div></div></section>`,
        missione: `${heading('Chi siamo', 'Identità e organizzazione del coordinamento comunale UDC Aprilia.')}<section class="section section-white elite-editorial"><div class="container"><div class="elite-editorial-intro"><span class="kicker">IDENTITÀ ISTITUZIONALE</span><h2>Il coordinamento UDC Aprilia</h2><p>Il coordinamento comunale è il riferimento territoriale dell'Unione di Centro ad Aprilia. Questa pagina presenta identità, principi generali e struttura organizzativa, senza riproporre notizie o articoli di stampa.</p><p>L'Unione di Centro si richiama alla tradizione democratico-cristiana e popolare e ai principi di partecipazione, responsabilità, solidarietà e sussidiarietà.</p></div><div class="elite-editorial-grid"><article class="elite-editorial-card"><span class="kicker">IDENTITÀ</span><h3>Principi e riferimenti</h3><p>Centralità della persona, partecipazione civica e attenzione alle autonomie locali.</p><a class="text-link" href="https://www.udc-italia.it/manifesto/" target="_blank" rel="noopener noreferrer">Manifesto nazionale ↗</a></article><article class="elite-editorial-card"><span class="kicker">ORGANIZZAZIONE</span><h3>Direzione e organi</h3><p>Ruoli e struttura del coordinamento comunale, nelle rispettive pagine dedicate.</p><a class="text-link" href="organi.html">Direzione e direttivo →</a><a class="text-link" href="consiglio-generale.html">Consiglio generale →</a></article><article class="elite-editorial-card"><span class="kicker">CONTATTI</span><h3>Informazioni e partecipazione</h3><p>Recapiti, informazioni sul coordinamento e modalità di adesione.</p><a class="text-link" href="contatti.html">Contatta il coordinamento →</a><a class="text-link" href="tesseramento.html">Tesseramento →</a></article></div><div class="elite-editorial-related"><div><span class="kicker">LE ALTRE SEZIONI</span><h3>Attività e documentazione</h3><p>Per iniziative e appuntamenti consulta Attività UDC; per gli articoli delle testate consulta la Rassegna stampa.</p></div><div class="elite-editorial-related-links"><a class="text-link" href="rete-udc.html">Attività UDC →</a><a class="text-link" href="comunicati.html">Rassegna stampa →</a></div></div></div></section>`,
        programma: program ? programPublished() : `${heading('Programma amministrativo 2027–2032', 'Elezioni amministrative 2027 · informazioni sul percorso di elaborazione e approvazione.')}<section class="prog2027-hero" aria-labelledby="prog2027-title"><div class="container prog2027-grid"><div><span class="prog2027-kicker">UDC APRILIA · AMMINISTRATIVE 2027</span><h2 id="prog2027-title">Un documento in fase di esame.</h2><p class="prog2027-intro">Il coordinamento UDC Aprilia sta esaminando la proposta di programma amministrativo per il quinquennio 2027–2032, nell’ambito del proprio percorso di confronto interno.</p><div class="prog2027-status" role="status"><span class="prog2027-status-dot" aria-hidden="true"></span><div><strong>Programma non ancora approvato</strong><span>La versione ufficiale non è attualmente disponibile per la pubblicazione.</span></div></div><p class="prog2027-highlight"><strong>Il programma sarà pubblicato su questa pagina dopo l’approvazione del Consiglio Generale UDC Aprilia,</strong> secondo le procedure e le competenze degli organi del coordinamento.</p><div class="prog2027-actions"><a href="consiglio-generale.html" class="prog2027-primary">Il Consiglio Generale <span aria-hidden="true">→</span></a><a href="eventi.html" class="prog2027-secondary">Notizie e appuntamenti <span aria-hidden="true">↗</span></a></div></div><aside class="prog2027-side" aria-label="Informazioni sul documento"><img src="assets/logo.png" alt="Emblema UDC Aprilia" class="prog2027-logo"><span class="prog2027-side-caption">DOCUMENTI PROGRAMMATICI</span><strong class="prog2027-bigyear">2027<span>—</span>2032</strong><div class="prog2027-side-rule"></div><p>Presentazione pubblica del testo definitivo soltanto a conclusione del percorso di approvazione.</p><span class="prog2027-side-foot">COORDINAMENTO COMUNALE · APRILIA</span></aside></div></section><section class="section section-white prog2027-process"><div class="container"><span class="kicker">IL PERCORSO ISTITUZIONALE</span><h2>Dall'elaborazione alla pubblicazione</h2><p class="section-lead">Le fasi indicate descrivono il percorso previsto. L’esito e le date saranno comunicati a seguito delle decisioni degli organi competenti.</p><ol class="prog2027-steps"><li><span class="prog2027-number">01</span><div><h3>Esame del Direttivo</h3><p>Discussione della proposta e raccolta delle osservazioni e delle eventuali modifiche.</p></div></li><li><span class="prog2027-number">02</span><div><h3>Consiglio Generale</h3><p>Presentazione del documento e determinazioni secondo le procedure interne applicabili.</p></div></li><li><span class="prog2027-number">03</span><div><h3>Pubblicazione del documento approvato</h3><p>Disponibilità della versione finale sul sito, con data di approvazione e possibilità di consultare il PDF.</p></div></li></ol><div class="prog2027-disclaimer"><strong>Nota di trasparenza.</strong> La documentazione tecnica in esame non costituisce, fino all’approvazione, il programma ufficiale del coordinamento. L’eventuale programma elettorale depositato seguirà le procedure previste dalla normativa applicabile.</div></div></section>`,
        organi: `${heading('Organi e consiglio direttivo', 'Composizione del coordinamento comunale e incarichi.')}<section class="section section-white"><div class="container"><span class="kicker">Responsabili</span><h2>Il coordinamento</h2>${people(leadership)}<p class="section-lead"><a class="text-link" href="contatti.html">Contatti del coordinamento →</a></p><div style="margin-top:60px"><span class="kicker">Composizione</span><h2>Consiglio direttivo</h2>${people(directors)}</div>${formerProfiles.length ? `<div style="margin-top:60px"><h2>Storico degli incarichi</h2>${people(formerProfiles)}</div>` : ''}</div></section>`,
        consiglio: `${heading('Consiglio generale', 'I componenti e le rispettive responsabilità, con fotografia individuale in cornice rotonda.')}<section class="section section-white"><div class="container"><span class="kicker">Organizzazione del coordinamento</span><h2>Coordinatore e vicecoordinatrici</h2><div class="consiglio-annuncio" role="status"><span class="kicker">Prossima iniziativa</span><h2>Presentazione del Consiglio generale di Aprilia</h2><p>Stiamo organizzando un evento dedicato alla presentazione del Consiglio generale UDC di Aprilia. Sarà un’occasione per conoscere i componenti, condividere obiettivi e rafforzare il dialogo con la comunità. La data, il luogo e il programma saranno comunicati attraverso questo sito non appena definiti.</p><a class="text-link" href="eventi.html">Consulta gli eventi e gli aggiornamenti →</a></div><p class="section-lead">Le figure di coordinamento indicate per UDC Aprilia.</p>${people(leadership)}<p class="section-lead"><a class="text-link" href="contatti.html">Contatti del coordinamento →</a></p><div style="margin-top:65px"><span class="kicker">Composizione</span><h2>Componenti del Consiglio generale</h2><p class="section-lead">Composizione del Consiglio generale del coordinamento comunale.</p>${people(council, 'La composizione del Consiglio generale sarà resa nota in occasione della presentazione ufficiale.')}</div></div></section>`,
        eventi: `${heading('Eventi e appuntamenti', 'Incontri, manifestazioni e iniziative del coordinamento e del partito.')}${d.eventi.length ? eventFeature(d.eventi[0]) : '<p class="note">Non ci sono attività pubblicate.</p>'}${d.eventi.length > 1 ? `<section class="section section-white"><div class="container"><span class="kicker">Archivio e attività</span><h2>Altri eventi</h2>${eventCards(d.eventi.slice(1))}</div></section>` : ''} `,
        comunicati: `${heading('Rassegna stampa', 'Fonti giornalistiche, archivio documentale e ricerca estesa.')}<section class="section section-white"><div class="container"><div class="note">Le notizie appartengono alle rispettive testate: sono indicati titolo, data, fonte e collegamento originale. Le segnalazioni automatiche richiedono verifica presso l’editore. <a href="archivio-comunicati.html">Comunicati ufficiali →</a></div>${pressTicker(d.comunicati.filter(pressRelevant))}<section class="press-search-premium" aria-labelledby="press-search-title"><span class="kicker">CENTRO DOCUMENTAZIONE</span><h2 id="press-search-title">Ricerca nella stampa e nell’archivio</h2><p>Consulta tutte le schede conservate dal sito oppure avvia una ricerca aggiornata nella stampa online. Le segnalazioni della stampa online raccolte automaticamente sono consultabili qui, con 10 risultati per pagina. Per ulteriori risultati puoi aprire Google News.</p><form id="press-search-form" class="press-search-form" role="search"><div class="press-field press-field-wide"><label for="press-query">Parole chiave, persona o argomento</label><input id="press-query" type="search" placeholder="Es. Pietro Fazio, UDC Aprilia, sanità, urbanistica" autocomplete="off"></div><div class="press-field"><label for="press-field">Campo</label><select id="press-field"><option value="all">Tutti i campi</option><option value="title">Titolo</option><option value="author">Autore</option><option value="source">Testata / fonte</option><option value="topic">Argomento</option></select></div><div class="press-field"><label for="press-from">Dal</label><input id="press-from" type="date"></div><div class="press-field"><label for="press-to">Al</label><input id="press-to" type="date"></div><div class="press-search-actions"><button type="submit" class="press-search-submit">Cerca nell’archivio</button><button type="button" id="press-search-reset" class="press-search-reset">Azzera filtri</button></div></form><div class="press-external"><div><h3>Amplia la ricerca alla stampa online</h3><p>Qui sotto trovi le segnalazioni online raccolte automaticamente dai feed RSS, filtrabili e suddivise in pagine da 10. Il pulsante apre anche Google News per cercare ulteriori articoli: i suoi risultati non possono essere paginati direttamente da questo sito statico.</p></div><a id="press-external-link" href="https://news.google.com/search?hl=it&gl=IT&ceid=IT%3Ait&q=UDC%20Aprilia" target="_blank" rel="noopener noreferrer">Cerca nella stampa online ↗</a></div><section class="press-online-results" id="risultati-stampa-online" aria-label="Risultati stampa online raccolti"><h3>Articoli della stampa online indicizzati</h3><p class="note">Articoli con link a testate esterne, inclusi quelli raccolti periodicamente dai feed RSS. Non è una ricerca in tempo reale su tutto il web.</p><p class="press-online-count" role="status" aria-live="polite">Caricamento risultati…</p><div class="press-online-list"></div><nav class="press-pagination press-online-pagination" aria-label="Pagine risultati stampa online" hidden></nav><p class="press-online-empty" hidden>Nessuna segnalazione online indicizzata corrisponde alla ricerca. Usa «Cerca nella stampa online» per ampliare la ricerca su Google News.</p></section><details class="press-archive" id="archivio-stampa"><summary class="press-archive-summary"><span><span class="kicker">ARCHIVIO CONSERVATO</span><strong>Consulta tutti gli articoli registrati</strong><small>Ricerca per data, titolo, autore, fonte e argomento</small></span><span class="press-archive-chevron" aria-hidden="true">⌄</span></summary><div class="press-archive-body"><p class="press-archive-count" role="status" aria-live="polite"></p><div class="press-archive-results">${pressCards([...d.comunicati].sort((a, b) => String(b.data || '').localeCompare(String(a.data || ''))))}</div><nav class="press-pagination" aria-label="Pagine dei risultati della rassegna stampa" hidden></nav><p class="press-archive-empty" hidden>Nessun articolo registrato corrisponde ai filtri. Puoi estendere la ricerca alla stampa online.</p></div></details></section></div></section>`,
        lettere: `${heading('Lettere e comunicazioni istituzionali', 'Lettere inviate, consegne PEC, protocolli, risposte ed esiti documentati, distinti per anno.')}<section class="section section-white"><div class="container"><div class="note">Archivio pubblico delle iniziative del Coordinamento comunale UDC Aprilia: lettere inviate, stato PEC, eventuale protocollo, sintesi dei riscontri ed esiti documentati. I documenti sono distinti dai <a href="archivio-comunicati.html">comunicati stampa</a> e dalla <a href="comunicati.html">rassegna stampa</a>. La consegna PEC e la protocollazione non dimostrano l’accoglimento di una richiesta. Gli stati indicati sono informazioni documentate e non giudizi sull’operato degli enti. I documenti riservati, le ricevute PEC complete e le risposte non pubblicabili rimangono fuori dal sito e dal repository GitHub. Le risposte integrali appaiono soltanto dopo una verifica specifica della pubblicabilità.</div>${documentCards(d.lettere || [], 'lettera')}</div></section>`,
        documenti: `${heading('Archivio comunicati ufficiali', 'Comunicati stampa ufficiali inviati alle redazioni, disponibili in PDF o Word e organizzati per anno.')}<section class="section section-white"><div class="container"><div class="note">Archivio dei comunicati stampa del Coordinamento comunale UDC Aprilia, pubblicati in PDF o Word e suddivisi per anno. Sono inseriti esclusivamente documenti destinati alla diffusione pubblica. </div>${documentCards(d.documenti || [])}</div></section>`,
        galleria: `${heading('Galleria fotografica', 'Immagini degli appuntamenti e delle attività del partito.')}<section class="section section-white"><div class="container"><span class="kicker">Archivio fotografico</span><h2>Momenti e incontri</h2><p class="section-lead">Tutte le immagini dell’archivio. Tutte le fotografie partecipano automaticamente allo slideshow della Home, in ordine casuale a ogni visita.</p>${fotoArchivio.length ? `<div class="gallery">${fotoArchivio.map(f => `<figure tabindex="0" role="button" data-photo="${asset(f.file)}" aria-label="Ingrandisci ${escape(f.titolo || 'Fotografia UDC Aprilia')}"><img src="${asset(f.file)}" alt="${escape(f.titolo || 'Fotografia UDC Aprilia')}" loading="lazy"><figcaption>${escape(f.titolo || 'Fotografia UDC Aprilia')}</figcaption></figure>`).join('')}</div>` : '<div class="empty">Non sono ancora state pubblicate fotografie.</div>'}</div></section><dialog id="lightbox" aria-label="Foto ingrandita"><button type="button" aria-label="Chiudi">×</button><img src="" alt=""></dialog>`,
        collegamenti: `${heading('Collegamenti UDC', 'Una rete organizzata per il livello nazionale, regionale, provinciale e comunale.')}<section class="section section-white"><div class="container"><span class="kicker">Rete del partito</span><h2>I riferimenti territoriali</h2><p class="section-lead">Per evitare collegamenti errati, i siti territoriali non ancora verificati sono indicati come in aggiornamento. I link si attivano inserendo l'indirizzo ufficiale nel file dei contenuti.</p>${territorial()}</div></section>`,
        contatti: `${heading('Contatti', 'Recapiti e uffici del coordinamento comunale UDC Aprilia.')}<section class="section section-white"><div class="container"><div class="contact-intro"><span class="kicker">Contatti istituzionali</span><h2>Come contattare UDC Aprilia</h2><p>Per facilitare la comunicazione, scegli l’indirizzo email più adatto alla tua richiesta. Se non sai a quale ufficio rivolgerti, usa la casella generale.</p><a class="contact-feature" href="mailto:${escape(d.contatti.email)}"><span>RECAPITO GENERALE</span><strong>${escape(d.contatti.email)}</strong><span>Scrivi una email ↗</span></a></div><div class="contact-grid">${(d.contatti.uffici || []).filter(c => c.email !== d.contatti.email).map(c => `<article class="contact-card"><span class="contact-card-kicker">UDC APRILIA</span><h3>${escape(c.nome)}</h3><p>${escape(c.descrizione)}</p><a href="mailto:${escape(c.email)}">${escape(c.email)} ↗</a></article>`).join('')}</div><div class="contact-note"><p>Per i contatti nazionali consulta il <a href="https://www.udc-italia.it/contatti/" target="_blank" rel="noopener noreferrer">sito UDC Italia ↗</a>.</p></div></div></section>`,
        tesseramento: `${heading('Tesseramento', 'Informazioni per conoscere le modalità di adesione all’UDC Aprilia.')}<section class="section section-white"><div class="container membership-wrap"><div class="membership-intro"><span class="kicker">Partecipazione e responsabilità</span><h2>La partecipazione comincia da una scelta consapevole.</h2><p class="membership-lead">Aderire a un partito significa scegliere di partecipare alla vita democratica, conoscere idee e proposte e contribuire al confronto sul futuro della propria comunità.</p><p>Il coordinamento UDC Aprilia è un punto di riferimento per chi desidera informarsi sulle iniziative del partito, approfondire i suoi principi e comprendere in che modo partecipare alle attività sul territorio.</p></div><div class="membership-values"><article><span>01</span><h3>Conoscere e confrontarsi</h3><p>Approfondire orientamenti, documenti e proposte, esprimendo opinioni nel rispetto delle differenze.</p></article><article><span>02</span><h3>Partecipare alla vita locale</h3><p>Seguire incontri e iniziative e contribuire, secondo le modalità previste, alle attività del coordinamento.</p></article><article><span>03</span><h3>Assumersi una responsabilità</h3><p>Vivere l’impegno civico con serietà, ascolto e attenzione alle esigenze della città.</p></article></div><div class="membership-action"><div><span class="kicker">Informazioni e modulistica</span><h2>Come richiedere l’adesione</h2><ol><li><strong>Scarica il modulo ufficiale UDC 2026</strong> dal sito del partito nazionale e consulta il regolamento di tesseramento.</li><li><strong>Compila la domanda in ogni sua parte</strong>, dopo aver letto l’informativa privacy ufficiale e verificato con la segreteria requisiti, eventuale quota e procedure attualmente valide.</li><li><strong>Consegna il modulo compilato a mano al coordinatore comunale di Aprilia, Pietro Fazio, oppure contatta la segreteria UDC Aprilia per concordarne la consegna. Le domande ricevute localmente vengono trasmesse alla Segreteria regionale UDC Lazio per gli adempimenti di competenza.</strong></li></ol><p class="membership-warning">Il modulo collegato proviene dal sito nazionale UDC. Il coordinamento di Aprilia riceve la documentazione e la inoltra alla Segreteria regionale UDC Lazio. <strong>La consegna locale non equivale automaticamente alla convalida dell’iscrizione</strong>, che segue le disposizioni nazionali del partito. Il regolamento PDF pubblicato nel marzo 2026 menziona la campagna straordinaria fino al 31 luglio 2026: prima di aderire verifica con la segreteria le disposizioni e le scadenze attualmente applicabili. Per tutelare la riservatezza, non inviare via email ordinaria il modulo compilato o copie dei documenti d’identità.</p></div><div class="membership-panel"><img src="assets/logo.png" alt="UDC Aprilia" width="92" height="92"><h3>Ufficio tesseramento</h3><a class="membership-email" href="mailto:tesseramento@udc-aprilia.it?subject=Richiesta%20informazioni%20tesseramento%20UDC%20Aprilia">tesseramento@udc-aprilia.it</a><a class="btn btn-elite-primary" href="https://www.udc-italia.it/wp-content/uploads/2026/03/Adesione-Modulo-per-Tesseramento-UDC-2026.pdf" target="_blank" rel="noopener noreferrer">Scarica modulo ufficiale UDC 2026 ↗</a><a class="membership-privacy-link" href="https://www.udc-italia.it/wp-content/uploads/2026/03/Regolamento-Tesseramento-A4.pdf" target="_blank" rel="noopener noreferrer">Consulta il regolamento ufficiale ↗</a><a class="membership-privacy-link" href="https://tesseramento.udc-italia.it/Tesseramento/Passo1" target="_blank" rel="noopener noreferrer">Tesseramento sul sito nazionale ↗</a><a class="membership-privacy-link" href="privacy.html">Privacy del sito UDC Aprilia →</a><small>I documenti si aprono direttamente sul sito nazionale e possono essere salvati o stampati dal browser. Prima della consegna è necessaria l’informativa privacy effettivamente applicabile al tesseramento.</small></div></div><div class="membership-bottom"><h2>Hai bisogno di informazioni?</h2><p>Per organizzare la consegna a mano del modulo ufficiale al coordinatore comunale Pietro Fazio, o per concordare una modalità di consegna con la segreteria, scrivi ai recapiti del coordinamento.</p><a class="text-link" href="mailto:segreteria@udc-aprilia.it?subject=Consegna%20modulo%20tesseramento%20UDC%20Aprilia">Contatta la segreteria per la consegna →</a></div></div></section>`,
        privacy: `${heading('Privacy e protezione dei dati', 'Informativa sul sito e sulle comunicazioni istituzionali.')}<section class="section section-white"><div class="container prose privacy-prose"><p class="section-lead"><strong>Informativa ai sensi degli articoli 12 e 13 del Regolamento (UE) 2016/679.</strong> Aggiornamento: 23 novembre 2026.</p><h2>1. Ambito e natura del sito</h2><p>Il sito udc-aprilia.it è un’iniziativa personale di Pietro Fazio, realizzata e gestita nell’ambito del suo incarico di coordinatore comunale UDC Aprilia. È un sito informativo statico pubblicato tramite GitHub Pages. Non sono previsti account, moduli web di contatto o iscrizione, né sistemi di profilazione dichiarati dal gestore. Questa informativa riguarda la navigazione e la corrispondenza locale, non i trattamenti autonomi delle strutture regionali o nazionali UDC.</p><h2>2. Titolare del trattamento e recapiti</h2><p>Per le attività relative al sito e alle caselle di corrispondenza locale, Pietro Fazio determina direttamente le finalità e i mezzi operativi del trattamento nell’ambito della propria iniziativa. Ai fini di questa informativa è indicato come titolare per tali attività, ferma la necessità di verificare eventuali attribuzioni o istruzioni formali dell’organizzazione UDC che possano modificare la qualificazione dei ruoli. Contatto privacy: <a href="mailto:info@udc-aprilia.it">info@udc-aprilia.it</a>. Altri recapiti, tutti gestiti direttamente da Pietro Fazio: <a href="mailto:segreteria@udc-aprilia.it">segreteria@udc-aprilia.it</a> (segreteria), <a href="mailto:tesseramento@udc-aprilia.it">tesseramento@udc-aprilia.it</a> (informazioni sul tesseramento), <a href="mailto:coordinatore@udc-aprilia.it">coordinatore@udc-aprilia.it</a> (coordinatore). Le attività autonome delle strutture UDC competenti sono soggette alle rispettive informative.</p><h2>3. Categorie di dati</h2><p>Durante la navigazione i fornitori tecnici possono trattare indirizzi IP, orari, dati di connessione e caratteristiche del dispositivo. Scrivendo volontariamente alle caselle indicate, l’interessato può comunicare indirizzo email, nome, contenuto del messaggio e allegati. In un contesto politico le comunicazioni possono rivelare opinioni politiche o altre categorie particolari di dati ai sensi dell’art. 9 GDPR. Non inviare via email ordinaria documenti d’identità, moduli di adesione compilati, deleghe o informazioni riservate senza aver concordato un canale adeguato.</p><h2>4. Finalità e basi giuridiche</h2><p>I dati tecnici sono trattati dai soggetti competenti per erogazione e sicurezza del sito, secondo le basi giuridiche applicabili, incluso il legittimo interesse ove pertinente (art. 6, par. 1, lett. f GDPR). I dati della corrispondenza ordinaria sono utilizzati per leggere, gestire e rispondere alle richieste volontarie, sulla base del legittimo interesse, ove applicabile, o di altra base adeguata alla singola situazione. Per obblighi legali si applica l’art. 6, par. 1, lett. c, ove pertinente. Il trattamento di dati particolari richiede inoltre una specifica condizione dell’art. 9, par. 2 GDPR, da individuare caso per caso: la semplice ricezione di un’email non autorizza ulteriori utilizzi politici. Non sono create automaticamente liste di propaganda, né svolta profilazione politica.</p><h2>5. Hosting e fornitori</h2><p>Le pagine sono ospitate su GitHub Pages. Il servizio email e la registrazione del dominio sono servizi distinti. I rispettivi fornitori possono trattare dati secondo il proprio ruolo e le proprie informative; l’identità del fornitore email, gli accordi applicabili e gli eventuali subfornitori devono essere verificati nella documentazione contrattuale. Informativa GitHub: <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement</a>.</p><h2>6. Cookie, strumenti esterni e collegamenti</h2><p>Secondo la configurazione dichiarata, il sito non integra Google Analytics, pixel pubblicitari o cookie di profilazione installati dal gestore. L’assenza di tali strumenti deve essere confermata con un controllo tecnico periodico delle richieste di rete e dei cookie effettivi. I collegamenti esterni aprono siti soggetti alle informative dei rispettivi gestori. Prima di introdurre servizi di analisi, video incorporati o strumenti non tecnici saranno valutati gli obblighi informativi e di consenso.</p><h2>7. Conservazione, accessi e comunicazioni</h2><p>Pietro Fazio gestisce direttamente le quattro caselle. Le comunicazioni ordinarie sono conservate per il tempo necessario a rispondere e, secondo la procedura dichiarata, non oltre 12 mesi dalla conclusione della gestione, salvo specifici obblighi di legge o documentate necessità di tutela dei diritti. È prevista una verifica almeno trimestrale per eliminare i messaggi non più necessari. I fornitori possono conservare copie tecniche secondo i rispettivi accordi. I dati possono essere comunicati alle strutture UDC competenti soltanto quando necessario, con adeguata base giuridica e informazione; i documenti di tesseramento seguono procedure separate. Eventuali trasferimenti fuori dallo SEE richiedono un idoneo presupposto del capo V GDPR.</p><h2>8. Tesseramento e dati politici</h2><p>Il sito non acquisisce online domande di iscrizione o deleghe. La casella <a href="mailto:tesseramento@udc-aprilia.it">tesseramento@udc-aprilia.it</a> è destinata a informazioni e all’organizzazione delle procedure, non all’invio ordinario di moduli compilati o documenti di identità. Le eventuali attività di raccolta cartacea, custodia temporanea e trasmissione alle strutture competenti richiedono l’informativa specifica del tesseramento e la corretta individuazione del titolare di tali operazioni. Questa informativa non sostituisce quella ufficiale del partito.</p><h2>9. Conferimento e diritti degli interessati</h2><p>La consultazione delle pagine non richiede di comunicare volontariamente dati identificativi al gestore, salvi i dati tecnici necessari alla connessione. Scrivere alle caselle è facoltativo; senza i dati necessari potrebbe non essere possibile rispondere. Nei casi previsti dagli artt. 15–22 GDPR si possono esercitare i diritti di accesso, rettifica, cancellazione, limitazione, opposizione e, ove applicabili, portabilità e revoca del consenso, scrivendo a <a href="mailto:info@udc-aprilia.it">info@udc-aprilia.it</a>. Le richieste sono gestite di regola entro un mese, salvo proroghe legittime. È possibile proporre reclamo al Garante: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">https://www.garanteprivacy.it</a>.</p><h2>10. Aggiornamenti e limiti dell’informativa</h2><p>Non vengono adottate tramite il sito decisioni basate esclusivamente su trattamenti automatizzati che producano effetti giuridici o analogamente significativi. Questa informativa sarà aggiornata al variare delle funzioni, dei fornitori o delle responsabilità. La pubblicazione non sostituisce la verifica delle effettive modalità di trattamento, delle misure di sicurezza, dei ruoli organizzativi e degli accordi con i fornitori.</p></div></section>`,
    };
    const returnNavigation = page === 'home' ? '' : `<nav class="return-navigation container" aria-label="Ritorno alla navigazione"><a href="index.html">← Torna alla home</a>${['comunicati', 'eventi'].includes(page) ? '<a href="notizie.html">Osservatorio notizie →</a>' : ''}</nav>`;
    const homeShortcut = ['notizie', 'rete'].includes(page) ? '<a class="floating-home" href="index.html" aria-label="Torna alla home di UDC Aprilia"><span aria-hidden="true">⌂</span><span class="floating-home-label">Home UDC Aprilia</span></a>' : '';
    document.getElementById('app').innerHTML = header + `<main id="contenuto">${returnNavigation}${content[page] || content.home}${extraUploads[page] || ''}</main>` + footer + homeShortcut;

    // Ricerca globale: usa esclusivamente i cataloghi pubblici già caricati.
    const globalSearch = () => {
        const panel=document.createElement('dialog');
        panel.id='global-search';
        panel.style.cssText='width:min(760px,94vw);max-height:85vh;overflow:auto;border:1px solid #b6c4d7;border-radius:14px;padding:24px;color:#102b50;background:white';
        const shadow=panel.appendChild(document.createElement('div')).attachShadow({mode:'open'});
        shadow.innerHTML=`<style>
        :host{font:16px/1.5 system-ui,sans-serif;color:#102b50}
        *{box-sizing:border-box} h2{font-size:1.4rem;margin:0} h3{font-size:1.05rem;line-height:1.4} p{margin:8px 0} a{color:#15457a;overflow-wrap:anywhere}
        .head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
        button{appearance:none;position:static;display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border:1px solid #102b50;border-radius:7px;background:#102b50;color:white;font:inherit;font-weight:600;cursor:pointer}
        .close{background:white;color:#102b50;padding:8px 12px;flex:none}
        input,select{display:block;width:100%;min-height:44px;border:1px solid #aab8c9;border-radius:7px;background:white;color:#102b50;padding:8px;font:inherit}
        label{display:block;font-size:.9rem} .filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}
        .submit,#global-results>button{width:100%;margin:8px 0} #global-count{font-weight:600} :focus-visible{outline:2px solid #2484cf;outline-offset:2px}
        @media(max-width:600px){.filters{grid-template-columns:1fr 1fr}.filters label:last-child{grid-column:1/-1}}
        </style><div class="head"><h2 id="global-search-title">Cerca nel sito</h2><button type="button" class="close" id="global-close">Chiudi ×</button></div><form id="global-search-form" role="search"><label for="global-query">Parole chiave</label><input id="global-query" type="search" placeholder="Articoli, documenti, eventi…" autocomplete="off" enterkeyhint="search"><div class="filters"><label>Categoria<select id="global-category"><option value="">Tutte</option></select></label><label>Anno<select id="global-year"><option value="">Tutti</option></select></label><label>Ordine<select id="global-order"><option value="score">Rilevanza</option><option value="date">Data</option></select></label></div><button class="submit" type="submit">Cerca</button></form><p id="global-count" role="status" aria-live="polite"></p><div id="global-results"></div><hr><p>Ricerca esterna: <a id="global-national" target="_blank" rel="noopener noreferrer">UDC Italia ↗</a> · <a id="global-news" target="_blank" rel="noopener noreferrer">Stampa online ↗</a></p>`;
        shadow.getElementById('global-close').addEventListener('click',()=>panel.close());
        panel.setAttribute('aria-label','Cerca nel sito');
        document.body.append(panel);
        const get=id=>shadow.getElementById(id), rows=[];
        const norm=v=>String(v??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it');
        const add=(category,title,description,date,url,extra='')=>{if(title&&safeUrl(url))rows.push({category,title:String(title),description:String(description||''),date:String(date||''),url:safeUrl(url),extra:String(extra||'')});};
        for(const x of d.comunicati||[]) add('Stampa',x.titolo,x.testo,x.data,safeUrl(x.link)||'comunicati.html',[x.fonte,x.autore,x.argomento].join(' '));
        for(const x of d.eventi||[]) add('Eventi',x.titolo,x.descrizione,x.data,'eventi.html#'+encodeURIComponent(eventId(x)),x.luogo);
        for(const [items,folder,category] of [[d.documenti,'documenti','Documenti'],[d.lettere,'lettere','Lettere']]) for(const x of items||[]){
            if(x.pubblica!==true||x.verifica_privacy!==true||!/^20\d{2}$/.test(String(x.anno))||!safeDocumentName(x.file))continue;
            add(category,x.titolo,x.descrizione,x.data,folder+'/'+x.anno+'/'+encodeURIComponent(x.file),[x.mittente,x.destinatario,x.materia,x.fascicolo,x.protocollo,x.esito_testo,x.categoria].join(' '));
        }
        for(const x of books) add('Cultura',x.titolo,x.descrizione,x.anno,'cultura.html',[x.autori,x.editore,x.isbn,x.tema,x.sottotitolo].join(' '));
        for(const x of profiles) add('Organi',x.nome,x.incarico,x.data_nomina,x.consiglio&&!x.coordinamento&&!x.direttivo?'consiglio-generale.html':'organi.html',x.testo);
        for(const x of fotoArchivio) add('Fotografie',x.titolo,x.descrizione,x.data,asset(x.file));
        if(program&&programUrl)add('Programma',program.titolo||'Programma 2027–2032',program.descrizione,program.data,programUrl);
        for(const group of groups) for(const [label,url] of group.children||[[group.label,group.href]]) add('Pagine',label,'Pagina istituzionale UDC Aprilia','',url);
        add('Pagine','UDC Italia','Sito nazionale ufficiale','',d.nazionale);
        for(const [key,url,label] of [['missione','missione.html','Missione'],['programma','programma.html','Programma 2027–2032'],['rete','rete-udc.html','Attività UDC'],['tesseramento','tesseramento.html','Tesseramento'],['collegamenti','collegamenti.html','Rete territoriale']]){
            const doc=new DOMParser().parseFromString(content[key]||'','text/html');
            const existing=rows.find(x=>x.category==='Pagine'&&x.url===safeUrl(url));
            if(existing)existing.extra=doc.body.textContent||'';else add('Pagine',label,'Pagina istituzionale','',url,doc.body.textContent);
        }

        const unique=new Map();for(const x of rows){const key=x.category+'|'+norm(x.title)+'|'+x.date;if(!unique.has(key)||(!x.url.includes('news.google.com')&&unique.get(key).url.includes('news.google.com')))unique.set(key,x);}
        const index=[...unique.values()];
        for(const c of [...new Set(index.map(x=>x.category))].sort())get('global-category').add(new Option(c,c));
        for(const y of [...new Set(index.map(x=>x.date.match(/^20\d{2}/)?.[0]).filter(Boolean))].sort().reverse())get('global-year').add(new Option(y,y));
        let limit=20;
        function renderSearch(){
            const q=get('global-query').value.trim(), words=norm(q).split(/\s+/).filter(Boolean), cat=get('global-category').value, year=get('global-year').value;
            const matches=index.filter(x=>(!cat||x.category===cat)&&(!year||x.date.startsWith(year))&&words.every(w=>norm([x.title,x.description,x.extra,x.date,x.category].join(' ')).includes(w))).map(x=>({...x,score:words.reduce((n,w)=>n+(norm(x.title).includes(w)?5:1),0)})).sort((a,b)=>(get('global-order').value==='score'?b.score-a.score:0)||b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'it'));
            get('global-count').textContent=matches.length+' risultati';
            const out=get('global-results');out.replaceChildren();
            for(const x of matches.slice(0,limit)){const article=document.createElement('article');article.style.cssText='border-top:1px solid #dce3eb;padding:14px 0';const meta=document.createElement('small');meta.textContent=x.category+(x.date?' · '+x.date:'');const h=document.createElement('h3');h.style.margin='6px 0';const a=document.createElement('a');a.href=x.url;a.textContent=x.title;if(new URL(x.url).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}h.append(a);const p=document.createElement('p');p.textContent=x.description.slice(0,350);article.append(meta,h,p);out.append(article);}
            if(matches.length>limit){const more=document.createElement('button');more.type='button';more.textContent='Mostra altri risultati';more.onclick=()=>{limit+=20;renderSearch();};out.append(more);}
            get('global-national').href='https://www.google.com/search?q='+encodeURIComponent('site:udc-italia.it '+q);
            get('global-news').href='https://news.google.com/search?q='+encodeURIComponent('UDC Aprilia '+q)+'&hl=it&gl=IT&ceid=IT:it';
        }
        get('global-search-form').addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();get('global-query').blur();limit=20;renderSearch();});
        get('global-search-form').addEventListener('change',e=>{if(e.target.tagName==='SELECT'){limit=20;renderSearch();}});
        document.querySelectorAll('[data-global-search]').forEach(b=>b.addEventListener('click',()=>{panel.showModal();shadow.getElementById('global-close').focus({preventScroll:true});panel.scrollTop=0;get('global-count').textContent='Inserisci una parola chiave e premi Cerca.';get('global-results').replaceChildren();}));
        panel.showModal();panel.scrollTop=0;get('global-count').textContent='Inserisci una parola chiave e premi Cerca.';get('global-results').replaceChildren();
    };
    document.querySelectorAll('[data-global-search]').forEach(button=>button.addEventListener('click',globalSearch,{once:true}));
    if (page === 'comunicati') {
        const flow = document.querySelector('.press-flow');
        if (flow) {
            const windowEl = flow.querySelector('.press-flow-window');
            const button = flow.querySelector('.press-flow-toggle');
            const reduced = matchMedia('(prefers-reduced-motion: reduce)');
            let paused = reduced.matches, hover = false, focused = false, previous = 0, raf = 0;
            const sync = () => { button.setAttribute('aria-pressed', String(paused)); button.textContent = paused ? '▶ Riprendi' : 'Ⅱ Pausa'; button.setAttribute('aria-label', paused ? 'Riprendi lo scorrimento' : 'Metti in pausa lo scorrimento'); };
            sync();
            button.addEventListener('click', () => { paused = !paused; sync(); });
            windowEl.addEventListener('mouseenter', () => hover = true);
            windowEl.addEventListener('mouseleave', () => hover = false);
            windowEl.addEventListener('focusin', () => focused = true);
            windowEl.addEventListener('focusout', () => focused = false);
            reduced.addEventListener?.('change', e => { if (e.matches) {
                paused = true;
                sync();
            } });
            const tick = time => {
                const delta = previous ? Math.min(time - previous, 80) : 0;
                previous = time;
                if (!paused && !hover && !focused && !document.hidden && windowEl.scrollWidth > windowEl.clientWidth) {
                    const end = windowEl.scrollWidth - windowEl.clientWidth;
                    if (windowEl.scrollLeft >= end - 1)
                        windowEl.scrollLeft = 0;
                    else
                        windowEl.scrollLeft += delta * 0.028;
                }
                raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
        }
    }
    if (page === 'comunicati') {
        const archive = document.querySelector('.press-archive');
        const form = document.querySelector('#press-search-form');
        if (archive && form) {
            const query = document.querySelector('#press-query');
            const field = document.querySelector('#press-field');
            const from = document.querySelector('#press-from');
            const to = document.querySelector('#press-to');
            const cards = [...archive.querySelectorAll('.press-archive-results .card')];
            const counter = archive.querySelector('.press-archive-count');
            const empty = archive.querySelector('.press-archive-empty');
            const pagination = archive.querySelector('.press-pagination');
            const pageSize = 10;
            let currentPage = 1;
            let matchedCards = [];
            const external = document.querySelector('#press-external-link');
            const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it-IT');
            // Interpreta eventuali operatori data digitati nel campo parole chiave.
            // Le date del form prevalgono; gli operatori non devono diventare parole da cercare.
            const searchInput = () => {
                const raw = query.value.trim();
                const embeddedFrom = raw.match(/\bafter:(\d{4}-\d{2}-\d{2})\b/i);
                const embeddedTo = raw.match(/\bbefore:(\d{4}-\d{2}-\d{2})\b/i);
                const cleaned = raw.replace(/\b(?:after|before):\d{4}-\d{2}-\d{2}\b/gi, ' ')
                    .replace(/^\s*tutto\s+(?:su|riguardo\s+a)\s+/i, '').replace(/\s+/g, ' ').trim();
                return { cleaned, start: from.value || embeddedFrom?.[1] || '', end: to.value || embeddedTo?.[1] || '' };
            };
            const queryMatches = (content, words) => {
                if (!words.length)
                    return true;
                const haystack = normalize(content);
                // La ricerca UDC Aprilia + Fazio non deve escludere gli articoli
                // che citano soltanto una delle due espressioni identificative.
                const generic = new Set(['udc', 'aprilia', 'pietro', 'fazio', 'coordinatore']);
                const specifics = words.filter(w => !generic.has(w));
                if (specifics.length)
                    return specifics.every(w => haystack.includes(w));
                return words.some(w => haystack.includes(w)) &&
                    (haystack.includes('udc') || haystack.includes('fazio'));
            };
            const showPage = (requestedPage, scroll = false) => {
                const totalPages = Math.ceil(matchedCards.length / pageSize);
                currentPage = Math.max(1, Math.min(requestedPage, totalPages || 1));
                cards.forEach(card => { card.hidden = true; });
                matchedCards.slice((currentPage - 1) * pageSize, currentPage * pageSize).forEach(card => { card.hidden = false; });
                pagination.replaceChildren();
                pagination.hidden = totalPages <= 1;
                if (totalPages > 1) {
                    const addButton = (label, pageNumber, disabled = false, active = false) => {
                        const button = document.createElement('button');
                        button.type = 'button';
                        button.textContent = label;
                        button.disabled = disabled;
                        if (active)
                            button.setAttribute('aria-current', 'page');
                        button.addEventListener('click', () => showPage(pageNumber, true));
                        pagination.appendChild(button);
                    };
                    addButton('← Precedente', currentPage - 1, currentPage === 1);
                    const pages = new Set([1, totalPages]);
                    for (let n = Math.max(1, currentPage - 2); n <= Math.min(totalPages, currentPage + 2); n++)
                        pages.add(n);
                    let previous = 0;
                    [...pages].sort((a, b) => a - b).forEach(n => {
                        if (n > previous + 1) {
                            const dots = document.createElement('span');
                            dots.textContent = '…';
                            dots.setAttribute('aria-hidden', 'true');
                            pagination.appendChild(dots);
                        }
                        addButton(String(n), n, false, n === currentPage);
                        previous = n;
                    });
                    addButton('Successiva →', currentPage + 1, currentPage === totalPages);
                }
                const first = matchedCards.length ? (currentPage - 1) * pageSize + 1 : 0;
                const last = Math.min(currentPage * pageSize, matchedCards.length);
                counter.textContent = `${matchedCards.length} ${matchedCards.length === 1 ? 'articolo trovato' : 'articoli trovati'} · Visualizzati ${first}–${last}${totalPages > 1 ? ` · Pagina ${currentPage} di ${totalPages}` : ''} · Ordine: dal più recente al meno recente`;
                empty.hidden = matchedCards.length !== 0;
                if (scroll)
                    archive.querySelector('.press-archive-body').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
            };
            // Risultati esterni: indice RSS raccolto dal workflow GitHub Actions.
            // Non tentiamo di leggere/suddividere la pagina Google News (cross-origin).
            const onlineSection = document.querySelector('.press-online-results');
            const onlineList = onlineSection.querySelector('.press-online-list');
            const onlineCount = onlineSection.querySelector('.press-online-count');
            const onlinePages = onlineSection.querySelector('.press-online-pagination');
            const onlineEmpty = onlineSection.querySelector('.press-online-empty');
            let onlineItems = [];
            let onlineMatches = [];
            let onlinePage = 1;
            const onlineCard = item => {
                const article = document.createElement('article');
                article.className = 'press-online-item';
                const meta = document.createElement('p');
                meta.className = 'meta';
                meta.textContent = `${item.data || 'Data non disponibile'} · ${item.fonte || 'Fonte esterna'}`;
                const title = document.createElement('h4');
                const a = document.createElement('a');
                a.textContent = item.titolo || 'Articolo';
                if (/^https:\/\//i.test(item.link || '')) {
                    a.href = item.link;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                }
                title.appendChild(a);
                article.append(meta, title);
                if (Array.isArray(item.pdf_collegati) && item.pdf_collegati.length) {
                    const pdfList = document.createElement('div');
                    pdfList.className = 'press-pdf-links';
                    item.pdf_collegati.forEach(pdf => {
                        if (!pdf || !/^[\w.-]+\.pdf$/i.test(pdf.file || ''))
                            return;
                        const link = document.createElement('a');
                        link.href = 'documenti/' + encodeURIComponent(String(pdf.data || '').slice(0, 4)) + '/' + encodeURIComponent(pdf.file);
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.textContent = 'PDF potenzialmente collegato (da verificare): ' + (pdf.titolo || pdf.file);
                        pdfList.appendChild(link);
                    });
                    article.appendChild(pdfList);
                }
                return article;
            };
            const renderOnline = (requested, scroll = false) => {
                const total = Math.ceil(onlineMatches.length / pageSize);
                onlinePage = Math.max(1, Math.min(requested, total || 1));
                onlineList.replaceChildren(...onlineMatches.slice((onlinePage - 1) * pageSize, onlinePage * pageSize).map(onlineCard));
                onlinePages.replaceChildren();
                onlinePages.hidden = total <= 1;
                const add = (label, number, disabled = false) => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.textContent = label;
                    b.disabled = disabled;
                    if (number === onlinePage && !disabled)
                        b.setAttribute('aria-current', 'page');
                    b.addEventListener('click', () => renderOnline(number, true));
                    onlinePages.appendChild(b);
                };
                if (total > 1) {
                    add('← Precedente', onlinePage - 1, onlinePage === 1);
                    const nums = new Set([1, total]);
                    for (let n = Math.max(1, onlinePage - 2); n <= Math.min(total, onlinePage + 2); n++)
                        nums.add(n);
                    let previous = 0;
                    [...nums].sort((a, b) => a - b).forEach(n => {
                        if (n > previous + 1) {
                            const dots = document.createElement('span');
                            dots.textContent = '…';
                            onlinePages.appendChild(dots);
                        }
                        add(String(n), n);
                        previous = n;
                    });
                    add('Successiva →', onlinePage + 1, onlinePage === total);
                }
                onlineCount.textContent = `${onlineMatches.length} segnalazioni online indicizzate · ${onlineMatches.length ? `Visualizzati ${(onlinePage - 1) * pageSize + 1}–${Math.min(onlinePage * pageSize, onlineMatches.length)}` : 'Nessun risultato'} · Pagina ${onlinePage} di ${total || 1} · Dal più recente al meno recente`;
                onlineEmpty.hidden = onlineMatches.length !== 0;
                if (scroll)
                    onlineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            const refreshOnline = () => {
                const { cleaned, start, end } = searchInput();
                const words = normalize(cleaned).split(/\s+/).filter(Boolean);
                onlineMatches = onlineItems.filter(item => {
                    const content = field.value === 'title' ? item.titolo : field.value === 'author' ? item.autore : field.value === 'source' ? item.fonte : field.value === 'topic' ? item.argomento : [item.titolo, item.testo, item.fonte, item.autore, item.argomento].join(' ');
                    return queryMatches(content, words) && (!start || item.data >= start) && (!end || item.data <= end);
                });
                renderOnline(1);
            };
            const bundledPressIndex = [{ "id": "rassegna-latinanews-2026-11-20-fazio-sanita", "data": "2026-11-20", "titolo": "Sanità, Fazio: “Ad Aprilia attenzione concreta della Regione Lazio”", "testo": "Articolo di Carmen Porcelli sulle dichiarazioni di Pietro Fazio, coordinatore cittadino UDC Aprilia, riguardo ai potenziamenti sanitari programmati dalla Regione Lazio.", "fonte": "Latina News", "autore": "Carmen Porcelli", "link": "https://www.latinanews.eu/sanita-fazio-ad-aprilia-attenzione-concreta-della-regione-lazio/", "tipo_link": "diretto", "origine": "inserimento_verificato" }, { "id": "rassegna-verificata-2026-10-07-5", "data": "2026-10-07", "titolo": "Avviso Generazione Sport, l’UDC di Aprilia: un’opportunità da cogliere", "testo": "Approfondimento pubblicato dalla testata indicata.", "fonte": "Radio Studio 93", "link": "https://www.studio93.it/avviso-generazione-sport-ludc-di-aprilia-e-unopportunita-da-cogliere" }, { "id": "rassegna-verificata-2026-09-24-6", "data": "2026-09-24", "titolo": "Aprilia, strisce blu: l’UDC chiede un tavolo dopo la sentenza del TAR", "testo": "Approfondimento pubblicato dalla testata indicata.", "fonte": "Radio Studio 93", "link": "https://www.studio93.it/aprilia-strisce-blu-dopo-la-sentenza-del-tar-ludc-chiede-un-tavolo-per-analizzare-dati-e-migliorare-la-sosta" }, { "id": "rassegna-verificata-2026-08-06-8", "data": "2026-08-06", "titolo": "Spari in via degli Oleandri, l’UDC Aprilia: più sicurezza", "testo": "Approfondimento pubblicato dalla testata indicata.", "fonte": "Sfera Magazine", "link": "https://www.sferamagazine.it/aprilia/spari-in-via-degli-oleandri-ludc-aprilia-piu-sicurezza/" }, { "id": "rassegna-verificata-2026-06-24-7", "data": "2026-06-24", "titolo": "UDC Aprilia: tutelare i lavoratori della Koch-Glitsch", "testo": "Approfondimento pubblicato dalla testata indicata.", "fonte": "ApriliaNews", "link": "https://www.aprilianews.it/politica/udc-aprilia-tutelare-i-lavoratori-della-koch-glitsch-e-salvare-il-patrimonio-produttivo-della-citta/" }, { "id": "rassegna-2026-05-06", "data": "2026-05-06", "titolo": "UDC Aprilia: non basta tornare al voto, serve nuova classe dirigente", "testo": "Riflessione pubblicata sul futuro amministrativo di Aprilia e sulla qualità della classe dirigente.", "fonte": "Sfera Magazine", "link": "https://www.sferamagazine.it/aprilia/udc-aprilia-non-basta-tornare-al-voto-serve-nuova-classe-dirigente/" }, { "id": "rassegna-2026-04-07", "data": "2026-04-07", "titolo": "Aprilia: Casa di Comunità, serve chiarezza", "testo": "Articolo sulle richieste di chiarimento dell’UDC Aprilia in materia di servizi sanitari territoriali.", "fonte": "Radio Studio 93", "link": "https://www.studio93.it/aprilia-casa-di-comunita-serve-chiarezza" }, { "id": "rassegna-2026-02-24", "data": "2026-02-24", "titolo": "UDC Aprilia: la politica della responsabilità oltre le polemiche", "testo": "Intervento riportato dalla testata sul confronto politico e sulla responsabilità amministrativa.", "fonte": "Sfera Magazine", "link": "https://www.sferamagazine.it/aprilia/udc-aprilia-la-politica-della-responsabilita-oltre-le-polemiche/" }, { "id": "rassegna-2026-01-26", "data": "2026-01-26", "titolo": "Aprilia, l’UDC: serve impegno per rilanciare l’identità della comunità", "testo": "Rassegna stampa: riflessione sul senso di comunità e sulle istituzioni cittadine.", "fonte": "Radio Studio 93", "link": "https://www.studio93.it/aprilia-ludc-serve-impegno-per-rilanciare-identita-della-nostra-comunita" }, { "id": "rassegna-2025-11-13", "data": "2025-11-13", "titolo": "Tutela dell’ambiente: proposta di un Comitato di monitoraggio", "testo": "La testata riferisce la proposta UDC di istituire un comitato permanente per il monitoraggio ambientale.", "fonte": "Radio Studio 93", "link": "https://www.studio93.it/tutela-dellambiente-ludc-di-aprilia-torna-a-proporre-il-comitato-di-monitoraggio" }];
            fetch('data/stampa.json', { cache: 'no-store' }).then(r => { if (!r.ok)
                throw Error('HTTP ' + r.status); return r.json(); }).then(items => {
                if (!Array.isArray(items))
                    throw Error('Formato indice non valido');
                // Articoli con collegamento esterno: redazionali e segnalazioni RSS; deduplicati.
                const seen = new Set();
                onlineItems = items.filter(item => item && item.titolo && item.data && /^https:\/\//i.test(item.link || ''))
                    .sort((a, b) => String(b.data).localeCompare(String(a.data)))
                    .filter(item => { const key = String(item.link).split('?')[0].replace(/\/$/, ''); if (seen.has(key))
                    return false; seen.add(key); return true; });
                refreshOnline();
            }).catch(() => {
                // Anteprima locale: usa il catalogo incorporato nello ZIP.
                onlineItems = bundledPressIndex.filter(item => item && item.titolo && item.data && /^https:\/\//i.test(item.link || '')).sort((a, b) => String(b.data).localeCompare(String(a.data)));
                refreshOnline();
            });
            const refresh = () => {
                const { cleaned: cleanedQuery, start, end } = searchInput();
                const searchWords = normalize(cleanedQuery).split(/\s+/).filter(Boolean);
                matchedCards = [];
                cards.forEach(card => {
                    const content = field.value === 'all' ? card.textContent + ' ' + Object.values(card.dataset).join(' ') :
                        field.value === 'title' ? card.dataset.title : field.value === 'author' ? card.dataset.author :
                            field.value === 'source' ? card.dataset.source : card.dataset.topic;
                    const date = card.dataset.date || '';
                    const matches = queryMatches(content, searchWords) && (!start || date >= start) && (!end || date <= end);
                    if (matches)
                        matchedCards.push(card);
                });
                showPage(1);
                refreshOnline();
                const terms = [];
                if (cleanedQuery)
                    terms.push(cleanedQuery);
                else
                    terms.push('UDC Aprilia');
                if (field.value === 'title' && cleanedQuery)
                    terms[0] = `intitle:${cleanedQuery}`;
                if (field.value === 'author' && cleanedQuery)
                    terms[0] = `"${cleanedQuery}"`;
                if (start)
                    terms.push('after:' + start);
                if (end)
                    terms.push('before:' + end);
                external.href = 'https://news.google.com/search?' + new URLSearchParams({ q: terms.join(' '), hl: 'it', gl: 'IT', ceid: 'IT:it' });
            };
            form.addEventListener('submit', event => { event.preventDefault(); archive.open = true; refresh(); archive.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); });
            [query, field, from, to].forEach(control => control.addEventListener('input', refresh));
            document.querySelector('#press-search-reset').addEventListener('click', () => { form.reset(); refresh(); });
            refresh();
        }
    }
    if (page === 'notizie' && typeof window.UDC_initHomeNews === 'function')
        window.UDC_initHomeNews({ stampa: d.comunicati, eventi: d.eventi });
    if (page === 'home' && typeof window.UDC_initHomeTeasers === 'function')
        window.UDC_initHomeTeasers({ stampa: d.comunicati });
    // Attività UDC usa solo contenuti istituzionali; nessuna duplicazione della stampa.
    document.getElementById('anno').textContent = new Date().getFullYear();
    const toggle = document.querySelector('.toggle');
    toggle.addEventListener('click', () => { const n = document.getElementById('menu'); const open = n.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu'); });
    document.querySelectorAll('.nav-group').forEach(detail => {
        detail.addEventListener('toggle', () => { if (detail.open)
            document.querySelectorAll('.nav-group').forEach(other => { if (other !== detail)
                other.open = false; }); });
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            document.querySelectorAll('.nav-group[open]').forEach(detail => detail.open = false);
            document.getElementById('menu').classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Apri il menu');
        }
    });
    // Dissolvenza automatica. Un solo punto di gestione per tutte le fotografie.
    const slider = document.querySelector('.elite-slideshow');
    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.elite-slide'));
        const dots = Array.from(slider.querySelectorAll('.elite-dots button'));
        const pause = slider.querySelector('.elite-playpause');
        const caption = slider.querySelector('#slide-caption');
        const captions = fotoHome.map(f => f.titolo || 'Fotografia UDC Aprilia');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let current = 0;
        let stopped = reduceMotion.matches;
        let timer = null;
        // Carica soltanto la foto corrente e quella successiva: l'archivio completo
        // resta nello slideshow senza scaricare tutte le immagini all'apertura.
        function loadSlide(index) {
            if (!slides.length)
                return;
            const img = slides[(index + slides.length) % slides.length].querySelector('img[data-src]');
            if (img) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        }
        loadSlide(1);
        function showSlide(index) {
            if (!slides.length)
                return;
            current = (index + slides.length) % slides.length;
            loadSlide(current);
            loadSlide(current + 1);
            slides.forEach((slide, i) => {
                const active = i === current;
                slide.classList.toggle('active', active);
                slide.setAttribute('aria-hidden', String(!active));
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('is-current', i === current);
                if (i === current)
                    dot.setAttribute('aria-current', 'true');
                else
                    dot.removeAttribute('aria-current');
            });
            caption.textContent = captions[current] || 'Il coordinamento sul territorio';
        }
        function start() {
            clearInterval(timer);
            if (!stopped && !document.hidden)
                timer = setInterval(() => showSlide(current + 1), 6500);
        }
        function updatePause() {
            pause.textContent = stopped ? '▶' : 'Ⅱ';
            pause.setAttribute('aria-label', stopped ? 'Riprendi la dissolvenza' : 'Metti in pausa la dissolvenza');
            pause.title = pause.getAttribute('aria-label');
        }
        dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); start(); }));
        pause.addEventListener('click', () => { stopped = !stopped; updatePause(); start(); });
        slider.addEventListener('mouseenter', () => clearInterval(timer));
        slider.addEventListener('mouseleave', start);
        slider.addEventListener('focusin', () => clearInterval(timer));
        slider.addEventListener('focusout', e => { if (!slider.contains(e.relatedTarget))
            start(); });
        document.addEventListener('visibilitychange', start);
        reduceMotion.addEventListener('change', e => { stopped = e.matches; updatePause(); start(); });
        if (slides.length < 2) {
            pause.hidden = true;
        }
        updatePause();
        start();
    }
    const dialog = document.getElementById('lightbox');
    if (dialog) {
        const show = figure => { const img = dialog.querySelector('img'); img.src = figure.dataset.photo; img.alt = figure.querySelector('img').alt; dialog.showModal(); };
        document.querySelectorAll('[data-photo]').forEach(f => { f.addEventListener('click', () => show(f)); f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            show(f);
        } }); });
        dialog.querySelector('button').addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', e => { if (e.target === dialog)
            dialog.close(); });
    }
})();

// Filtri delegati: funzionano anche dopo il rendering asincrono.
document.addEventListener('input', e => { if(!['letter-filter','letter-search'].includes(e.target.id)) return; const direction=document.getElementById('letter-filter').value, query=document.getElementById('letter-search').value.trim().toLocaleLowerCase('it'); for(const card of document.querySelectorAll('.archive-letter')) card.style.display=(!direction||card.dataset.direction===direction)&&card.textContent.toLocaleLowerCase('it').includes(query)?'':'none'; });
