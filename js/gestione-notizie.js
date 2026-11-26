/* Client editoriale statico: token mai persistito, richieste dirette a GitHub API. */
(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    let publicationData = null;
    const cfg = { profili: {path:'js/pubblicazioni.js',name:'Organi e profili'}, stampa: { path: 'data/stampa.json', name: 'Rassegna stampa' }, attivita: { path: 'data/attivita.json', name: 'Attività ed eventi' }, documenti: { path: 'data/documenti.json', name: 'Comunicati PDF' }, lettere: {path:'data/lettere.json',name:'Lettere istituzionali'} };
    const isPdf = () => kind === 'documenti' || kind === 'lettere';
    let session = null, kind = 'stampa', catalog = [], sha = null, busy = false;
    const status = (message, error = false) => { $('status').textContent = message; $('status').classList.toggle('error', error); };
    const clean = s => String(s || '').trim();
    const validRepo = s => /^[a-zA-Z0-9_.-]{1,100}$/.test(s) && !s.startsWith('.');
    const safeUrl = s => { try {
        const u = new URL(clean(s));
        return u.protocol === 'https:' ? u.href : '';
    }
    catch {
        return '';
    } };
    const fileApi = path => `https://api.github.com/repos/${encodeURIComponent(session.owner)}/${encodeURIComponent(session.repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
    const toBase64 = bytes => { let output = ''; for (let i = 0; i < bytes.length; i += 8192)
        output += String.fromCharCode(...bytes.subarray(i, i + 8192)); return btoa(output); };
    const json64 = x => toBase64(new TextEncoder().encode(JSON.stringify(x, null, 2) + '\n'));
    async function request(url, method = 'GET', data) {
        const r = await fetch(url, { method, headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + session.token, 'X-GitHub-Api-Version': '2022-11-28', ...(data ? { 'Content-Type': 'application/json' } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}), cache: 'no-store' });
        let result = {};
        try {
            result = await r.json();
        }
        catch { }
        if (!r.ok)
            throw new Error(r.status === 401 ? 'Credenziale errata o scaduta' : r.status === 403 ? 'Permessi GitHub insufficienti o limite API' : r.status === 404 ? 'Repository, branch o file non trovato' : r.status === 409 ? 'Conflitto: ricarica e riprova' : (result.message || 'HTTP ' + r.status));
        return result;
    }
    async function load() {
        sha = null; catalog = []; render();
        const result = await request(fileApi(cfg[kind].path) + '?ref=' + encodeURIComponent(session.branch));
        if (typeof result.content !== 'string')
            throw new Error('Archivio non leggibile');
        const bytes = Uint8Array.from(atob(result.content.replace(/\s/g, '')), c => c.charCodeAt(0));
        const raw = new TextDecoder().decode(bytes);
        let data;
        if (kind === 'profili') { publicationData = JSON.parse(raw.replace(/^\s*window\.UDCPubblicazioni\s*=\s*/, '').replace(/;\s*$/, '')); data = publicationData.profili; } else data = JSON.parse(raw);
        if (!Array.isArray(data))
            throw new Error('Archivio non valido');
        catalog = data;
        sha = result.sha;
        render();
    }
    async function save(next, action) { if (!sha) throw new Error('Archivio non caricato: premi Aggiorna.'); const response = await request(fileApi(cfg[kind].path), 'PUT', { message: action, content: kind === 'profili' ? toBase64(new TextEncoder().encode('window.UDCPubblicazioni = ' + JSON.stringify({...publicationData,profili:next},null,2) + ';\n')) : json64(next), sha, branch: session.branch }); sha = response.content.sha; if(kind === 'profili') publicationData.profili = next; catalog = next; render(); }
    async function withBusy(fn) { if (busy)
        return; busy = true; document.querySelectorAll('#workspace button').forEach(b => b.disabled = true); try {
        await fn();
    }
    catch (e) {
        status('Errore: ' + e.message, true);
    }
    finally {
        busy = false;
        document.querySelectorAll('#workspace button').forEach(b => b.disabled = false);
    } }
    function switchKind(next) { $('archive-search').value = ''; kind = next; resetForm(); $('common-fields').classList.toggle('hidden',kind === 'profili'); $('title').required = $('date').required = kind !== 'profili'; document.querySelectorAll('.tab').forEach(t => { const active = t.dataset.kind === kind; t.classList.toggle('active', active); t.setAttribute('aria-pressed', String(active)); }); for (const key of Object.keys(cfg))
        $(key + '-fields').classList.toggle('hidden', kind !== key); $('documenti-fields').classList.toggle('hidden', !isPdf()); $('category-label').classList.toggle('hidden',kind !== 'documenti'); $('form-heading').textContent = kind === 'profili' ? '3. Profilo istituzionale' : kind === 'stampa' ? '3. Nuovo articolo di stampa' : kind === 'attivita' ? '3. Nuova attività o evento' : kind === 'lettere' ? '3. Nuova lettera istituzionale' : '3. Nuovo comunicato ufficiale PDF'; $('form-help').textContent = kind === 'profili' ? 'Gestisci coordinamento, direttivo e Consiglio generale.' : kind === 'stampa' ? 'Articoli esterni: breve sintesi, testata e collegamento verificato.' : kind === 'attivita' ? 'Distingui un evento organizzato da UDC da una semplice partecipazione.' : 'Carica documenti ufficiali approvati in formato PDF.'; }
    function resetForm() { $('editor-form').reset(); $('item-id').value = ''; $('save').textContent = 'Pubblica contenuto'; }
    const itemKey = x => isPdf() ? String(x.anno) + '/' + String(x.file) : String(x.id);
    function render() {
        const target = $('listing');
        target.replaceChildren();
        if (!catalog.length) {
            const msg = document.createElement('div');
            msg.className = 'empty-editor';
            msg.textContent = 'Nessun contenuto pubblicato in questa sezione.';
            target.append(msg);
            return;
        }
        const query = clean($('archive-search').value).toLocaleLowerCase('it');
        for (const item of catalog.filter(x => [x.nome,x.incarico,x.titolo,x.data,x.destinatario,x.descrizione,x.fonte].join(' ').toLocaleLowerCase('it').includes(query)).sort((a, b) => String(b.data).localeCompare(String(a.data)))) {
            const el = document.createElement('article');
            el.className = 'editor-entry';
            const meta = document.createElement('div');
            meta.className = 'meta';
            meta.textContent = [item.data, kind === 'stampa' ? item.fonte : isPdf() ? 'Anno ' + item.anno : item.luogo].filter(Boolean).join(' · ');
            const title = document.createElement('h3');
            title.textContent = item.nome || item.titolo;
            const desc = document.createElement('p');
            desc.textContent = item.incarico || item.testo || item.descrizione || '';
            const actions = document.createElement('div');
            actions.className = 'actions';
            const edit = document.createElement('button');
            edit.className = 'secondary';
            edit.type = 'button';
            edit.textContent = 'Modifica';
            edit.addEventListener('click', () => editItem(item));
            const remove = document.createElement('button');
            remove.className = 'danger';
            remove.type = 'button';
            remove.textContent = 'Rimuovi';
            remove.addEventListener('click', () => { if (!confirm('Rimuovere “' + (item.nome || item.titolo) + '” dal sito pubblico?'))
                return; withBusy(async () => { await save(catalog.filter(x => itemKey(x) !== itemKey(item)), 'Rimuovi contenuto ' + itemKey(item)); status('Contenuto rimosso dal catalogo.'); }); });
            actions.append(edit, remove);
            el.append(meta, title, desc, actions);
            target.append(el);
        }
    }
    function editItem(x) {
        resetForm();
        $('item-id').value = itemKey(x);
        if(kind === 'profili') { $('profile-end').value=x.data_fine||''; $('profile-start').value=x.data_nomina||''; $('profile-name').value=x.nome||''; $('profile-role').value=x.incarico||''; $('profile-bio').value=x.testo||''; $('profile-contact').value=x.contatto||''; $('profile-lead').checked=!!x.coordinamento; $('profile-board').checked=!!x.direttivo; $('profile-council').checked=!!x.consiglio; $('profile-order').value=x.ordine||10; $('save').textContent='Salva modifiche'; return; }
        $('title').value = x.titolo;
        $('date').value = x.data;
        if (kind === 'stampa') {
            $('source').value = x.fonte || '';
            $('press-url').value = x.link || '';
            $('summary').value = x.testo || '';
        }
        if (kind === 'attivita') {
            $('place').value = x.luogo || '';
            $('event-type').value = x.tipo || 'partecipazione';
            $('event-description').value = x.descrizione || '';
            $('event-url').value = x.link || '';
            $('event-photo').value = x.foto || '';
        }
        if (isPdf()) {
            $('doc-category').value = x.categoria || 'comunicato'; $('doc-description').value = x.descrizione || ''; if (kind === 'lettere') { $('letter-recipient').value = x.destinatario || ''; $('letter-protocol').value = x.protocollo || ''; }
            $('doc-approved').checked = x.pubblica === true;
            $('doc-privacy').checked = x.verifica_privacy === true;
        }
        $('save').textContent = 'Salva modifiche';
        $('form-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    async function publish() { if (!sha) throw new Error('Archivio non caricato: premi Aggiorna.');
        const id = clean($('item-id').value);
        const old = id ? catalog.find(x => itemKey(x) === id) : null;
        if (id && !old)
            throw new Error('La voce da modificare non esiste più. Aggiorna elenco.');
        if(kind === 'profili') { const nome=clean($('profile-name').value), incarico=clean($('profile-role').value), coordinamento=$('profile-lead').checked,direttivo=$('profile-board').checked,consiglio=$('profile-council').checked; if(!nome||!incarico||!(coordinamento||direttivo||consiglio)||!$('profile-approved').checked) throw new Error('Compila nome, incarico, appartenenza e conferma pubblicabilità.'); const person={...old,id:old?.id||'profilo-'+crypto.randomUUID(),nome,incarico,coordinamento,direttivo,consiglio,ordine:Number($('profile-order').value)||10,testo:clean($('profile-bio').value),contatto:clean($('profile-contact').value),allegati:old?.allegati||[],data_nomina:$('profile-start').value,data_fine:$('profile-end').value}; if(person.data_nomina && person.data_fine && person.data_fine < person.data_nomina) throw new Error('La fine incarico precede la nomina.'); const photo=$('profile-photo').files[0]; if(photo){ if(photo.size<12||photo.size>5*1024*1024) throw new Error('Foto non valida o superiore a 5 MB.'); const bytes=new Uint8Array(await photo.arrayBuffer()); const ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b)); const ext=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'jpg':[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)?'png':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'?'webp':''; if(!ext) throw new Error('Formato foto non valido.'); const bitmap=await createImageBitmap(photo); bitmap.close(); if(!/^[a-zA-Z0-9_-]+$/.test(person.id)) throw new Error('Identificativo profilo non valido.'); person.foto='foto-'+crypto.randomUUID()+'.'+ext; person.foto_versione=Date.now().toString(); await request(fileApi('pubblicazioni/profili/'+person.id+'/'+person.foto),'PUT',{message:'Carica foto profilo '+person.id,content:toBase64(bytes),branch:session.branch}); } await save(old?catalog.map(x=>x.id===old.id?person:x):[...catalog,person],'Aggiorna profilo '+nome); resetForm(); status('Profilo salvato in GitHub.'); return; }
        const titolo = clean($('title').value), data = $('date').value;
        if (!titolo || !/^\d{4}-\d{2}-\d{2}$/.test(data))
            throw new Error('Indica titolo e data validi.');
        const next = isPdf() ? { ...old, data, titolo } : { id: old?.id || 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), data, titolo };
        if (kind === 'stampa') {
            const fonte = clean($('source').value), link = safeUrl($('press-url').value);
            if (!fonte || !link)
                throw new Error('Indica la testata e un URL HTTPS valido.');
            Object.assign(next, { fonte, link, testo: clean($('summary').value) });
        }
        if (kind === 'attivita') {
            const luogo = clean($('place').value), url = clean($('event-url').value);
            let foto = clean($('event-photo').value);
            if (!luogo)
                throw new Error('Indica il luogo.');
            if (url && !safeUrl(url))
                throw new Error('Il link deve essere HTTPS.');
            const photo = $('event-photo-file').files[0];
            if (photo) {
                if (!$('event-photo-approved').checked) throw new Error('Conferma diritti e privacy della foto.');
                if (photo.size < 12 || photo.size > 5 * 1024 * 1024) throw new Error('Foto non valida o superiore a 5 MB.');
                const bytes = new Uint8Array(await photo.arrayBuffer());
                const ascii = (a,b) => String.fromCharCode(...bytes.slice(a,b));
                const ext = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'jpg' :
                    [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v) ? 'png' :
                    ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP' ? 'webp' : '';
                if (!ext) throw new Error('Seleziona una foto JPEG, PNG o WebP.');
                const bitmap = await createImageBitmap(photo);
                bitmap.close();
                foto = 'evento-' + data + '-' + crypto.randomUUID() + '.' + ext;
                status('Carico la foto…');
                await request(fileApi('assets/' + foto), 'PUT', {message:'Carica foto evento ' + foto,content:toBase64(bytes),branch:session.branch});
                $('event-photo').value = foto;
                $('event-photo-file').value = '';
            }
            if (foto && !/^[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(foto))
                throw new Error('Nome foto non valido.');
            Object.assign(next, { luogo, tipo: $('event-type').value, descrizione: clean($('event-description').value), foto, link: url ? safeUrl(url) : '' });
        }
        if (isPdf()) {
            if (!$('doc-approved').checked || !$('doc-privacy').checked)
                throw new Error('Per pubblicare il PDF devi confermare sia l’approvazione del coordinamento sia la verifica della privacy.');
            if (kind === 'lettere') { Object.assign(next, old || {}, {data,titolo,destinatario:clean($('letter-recipient').value),protocollo:clean($('letter-protocol').value)}); if (!next.destinatario) throw new Error('Indica il destinatario istituzionale.'); }
            if(kind === 'documenti') next.categoria = $('doc-category').value;
            next.anno = data.slice(0, 4);
            next.descrizione = clean($('doc-description').value);
            next.pubblica = true;
            next.verifica_privacy = true;
            const file = $('document-file').files[0];
            if (!file && !old)
                throw new Error('Seleziona un PDF da caricare.');
            if (file) {
                if (!/\.pdf$/i.test(file.name) || file.size < 5 || file.size > 5 * 1024 * 1024)
                    throw new Error('Serve un PDF valido e non superiore a 5 MB.');
                const bytes = new Uint8Array(await file.arrayBuffer());
                if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-')
                    throw new Error('Il file selezionato non è un PDF valido.');
                const name = (kind === 'lettere' ? 'lettera-' : 'comunicato-') + data + '-' + Math.random().toString(36).slice(2, 9) + '.pdf';
                const path = (kind === 'lettere' ? 'lettere/' : 'documenti/') + next.anno + '/' + name;
                status('Carico il documento PDF nel repository…');
                await request(fileApi(path), 'PUT', { message: 'Carica comunicato ufficiale ' + name, content: toBase64(bytes), branch: session.branch });
                next.file = name;
            }
            else {
                if (old.anno !== next.anno)
                    throw new Error('Per cambiare anno a un PDF già pubblicato carica nuovamente il file.');
                next.file = old.file;
            }
        }
        const replacement = old ? catalog.map(x => itemKey(x) === itemKey(old) ? next : x) : [...catalog, next];
        await save(replacement, (old ? 'Aggiorna' : 'Pubblica') + ' ' + cfg[kind].name + ' ' + titolo.slice(0, 70));
        resetForm();
        status('Contenuto salvato in GitHub. Sarà visibile dopo la pubblicazione di GitHub Pages.');
    }
    $('connect').addEventListener('click', async () => {
        const owner = clean($('owner').value), repo = clean($('repo').value), branch = clean($('branch').value), token = clean($('token').value);
        if (!validRepo(owner) || !validRepo(repo) || !branch || !token) {
            status('Indica proprietario, repository, branch e token validi.', true);
            return;
        }
        session = { owner, repo, branch, token };
        $('connect').disabled = true;
        try {
            await load();
            $('token').value = '';
            $('login-panel').classList.add('hidden');
            $('workspace').classList.remove('hidden');
            status('Accesso riuscito. Puoi gestire contenuti e documenti.');
        }
        catch (e) {
            session = null;
            status('Accesso non riuscito: ' + e.message, true);
        }
        finally {
            $('connect').disabled = false;
        }
    });
    $('logout').addEventListener('click', () => { session = null; catalog = []; sha = null; $('workspace').classList.add('hidden'); $('login-panel').classList.remove('hidden'); $('token').value = ''; status('Sessione terminata.'); });
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => withBusy(async () => { switchKind(t.dataset.kind); await load(); status('Archivio ' + cfg[kind].name + ' caricato.'); })));
    $('refresh').addEventListener('click', () => withBusy(async () => { await load(); status('Elenco aggiornato.'); }));
    $('archive-search').addEventListener('input', render);
    $('cancel').addEventListener('click', resetForm);
    $('editor-form').addEventListener('submit', event => { event.preventDefault(); withBusy(publish); });
})();
