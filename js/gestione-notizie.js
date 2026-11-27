/* Client editoriale statico: token mai persistito, richieste dirette a GitHub API. */
(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    let publicationData = null;
    let pendingFiles = null;
    let publishing = false;
    const bookFields=["titolo","autori","sottotitolo","editore","anno","isbn","tema","descrizione","link_editore","link_pubblicazione","ordine"];
    const cfg = { cultura:{path:'js/pubblicazioni.js',name:'Cultura e biblioteca'}, profili: {path:'js/pubblicazioni.js',name:'Organi e profili'}, stampa: { path: 'data/stampa.json', name: 'Rassegna stampa' }, attivita: { path: 'data/attivita.json', name: 'Attività ed eventi' }, documenti: { path: 'data/documenti.json', name: 'Comunicati e documenti' }, lettere: {path:'data/lettere.json',name:'Lettere istituzionali'} };
    const isPdf = () => kind === 'documenti' || kind === 'lettere';
    let session = null, kind = 'stampa', catalog = [], sha = null, busy = false;
    const status = (message, error = false) => { $('status').textContent = message; $('status').classList.toggle('error', error); if(publishing){ const el=$('publish-status'); el.textContent=message; el.style.color=error?'#a12626':'#17643a'; } };
    const clean = s => String(s || '').trim();
    const letterId = x => x.id || 'lettera-'+x.anno+'-'+x.file;
    function letterOptions(current='') { const el=$('letter-related'); el.replaceChildren(new Option('Nessuno','')); for(const x of catalog) if(kind==='lettere' && letterId(x)!==current) el.add(new Option(x.titolo,letterId(x))); }
    function directionLabel(){ $('letter-party-label').firstChild.textContent=$('letter-direction').value==='entrata'?'Mittente istituzionale *':'Destinatario istituzionale *'; }
    function privacyReady(){return $('privacy-review').checked && $('privacy-redacted').checked && $('privacy-result').value==='clear' && (!['lettere','documenti'].includes(kind)||!$('document-file').files.length||$('privacy-pdf-manual').checked);}
    function updatePrivacy(){const pdf=['lettere','documenti'].includes(kind)&&$('document-file').files.length>0; $('privacy-pdf-manual').closest('label').hidden=!pdf; $('privacy-pdf-manual').closest('label').style.display=pdf?'flex':'none'; const ready=privacyReady(); $('save').disabled=busy||!ready||!session||!sha; $('privacy-status').textContent=ready?'Verifiche preliminari completate: restano i controlli finali.':'Pubblicazione bloccata: verifica incompleta o dati riservati.'; $('privacy-status').style.color=ready?'#17643a':'#a12626';}
    function privacyCheck(){if(!privacyReady()) throw new Error('Pubblicazione bloccata: completa le verifiche obbligatorie.'); if(!$('privacy-review').checked || !$('privacy-redacted').checked || $('privacy-result').value!=='clear') throw new Error('Pubblicazione bloccata: completa la verifica privacy.'); }
    function scanText(value){ const t=String(value); if(/\b[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]\b/i.test(t)||/\bIT\d{2}[A-Z]\d{10}[A-Z0-9]{12}\b/i.test(t)) throw new Error('Possibile codice fiscale o IBAN: verifica e rimuovi il dato prima di pubblicare.'); }
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
        if (kind === 'profili' || kind === 'cultura') { publicationData = JSON.parse(raw.replace(/^\s*window\.UDCPubblicazioni\s*=\s*/, '').replace(/;\s*$/, '')); data = publicationData[kind]; } else data = JSON.parse(raw);
        if (!Array.isArray(data))
            throw new Error('Archivio non valido');
        catalog = data; letterOptions();
        sha = result.sha;
        render();
    }
    async function atomicSave(content, action) {
        const root='https://api.github.com/repos/'+encodeURIComponent(session.owner)+'/'+encodeURIComponent(session.repo)+'/git';
        const refPath=root+'/refs/heads/'+session.branch.split('/').map(encodeURIComponent).join('/');
        const ref=await request(refPath);
        const parent=ref.object.sha;
        const commit=await request(root+'/commits/'+parent);
        const current=await request(fileApi(cfg[kind].path)+'?ref='+encodeURIComponent(parent));
        if(current.sha!==sha) throw new Error('Archivio modificato da un altro utente: aggiorna e riprova.');
        const tree=[];
        for(const file of [...pendingFiles,{path:cfg[kind].path,content}]){
            const blob=await request(root+'/blobs','POST',{content:file.content,encoding:'base64'});
            tree.push({path:file.path,mode:'100644',type:'blob',sha:blob.sha});
        }
        const newTree=await request(root+'/trees','POST',{base_tree:commit.tree.sha,tree});
        const newCommit=await request(root+'/commits','POST',{message:action,tree:newTree.sha,parents:[parent]});
        await request(refPath,'PATCH',{sha:newCommit.sha,force:false});
        return {content:{sha:tree[tree.length-1].sha}};
    }
    async function stageFile(path, content){ if(!pendingFiles) throw new Error('Sessione di pubblicazione non attiva.'); pendingFiles.push({path,content}); }
    async function save(next, action) { if (!sha) throw new Error('Archivio non caricato: premi Aggiorna.'); const content=(kind === 'profili' || kind === 'cultura') ? toBase64(new TextEncoder().encode('window.UDCPubblicazioni = ' + JSON.stringify({...publicationData,[kind]:next},null,2) + ';\n')) : json64(next); const response = pendingFiles ? await atomicSave(content,action) : await request(fileApi(cfg[kind].path),'PUT',{message:action,content,sha,branch:session.branch}); sha = response.content.sha; if(kind === 'profili' || kind === 'cultura') publicationData[kind] = next; catalog = next; render(); }
    async function withBusy(fn) { if (busy)
        return; busy = true; document.querySelectorAll('#workspace button').forEach(b => b.disabled = true); try {
        await fn();
    }
    catch (e) {
        status('Errore: ' + e.message, true);
    }
    finally {
        busy = false;
        document.querySelectorAll('#workspace button').forEach(b => b.disabled = false); updatePrivacy();
    } }
    function switchKind(next) { $('archive-search').value = ''; kind = next; resetForm(); $('common-fields').classList.toggle('hidden',['profili','cultura'].includes(kind)); $('title').required = $('date').required = !['profili','cultura'].includes(kind); document.querySelectorAll('.tab').forEach(t => { const active = t.dataset.kind === kind; t.classList.toggle('active', active); t.setAttribute('aria-pressed', String(active)); }); for (const key of Object.keys(cfg))
        $(key + '-fields').classList.toggle('hidden', kind !== key); $('documenti-fields').classList.toggle('hidden', !isPdf()); $('category-label').classList.toggle('hidden',kind !== 'documenti'); $('form-heading').textContent = kind === 'cultura' ? '3. Scheda libro' : kind === 'profili' ? '3. Profilo istituzionale' : kind === 'stampa' ? '3. Nuovo articolo di stampa' : kind === 'attivita' ? '3. Nuova attività o evento' : kind === 'lettere' ? '3. Nuova lettera istituzionale' : '3. Nuovo comunicato ufficiale'; $('form-help').textContent = kind === 'cultura' ? 'Aggiungi o modifica libri e copertine.' : kind === 'profili' ? 'Gestisci coordinamento, direttivo e Consiglio generale.' : kind === 'stampa' ? 'Articoli esterni: breve sintesi, testata e collegamento verificato.' : kind === 'attivita' ? 'Distingui un evento organizzato da UDC da una semplice partecipazione.' : 'Carica documenti ufficiali approvati in formato PDF o Word (.docx).'; }
    let previewObjectUrl = '';
    function showProfilePhoto(url) { const img=$('profile-preview'); img.hidden=!url; img.style.display=url?'block':'none'; $('profile-placeholder').hidden=!!url; if(url) img.src=url; else img.removeAttribute('src'); }
    function resetForm() { if(previewObjectUrl) URL.revokeObjectURL(previewObjectUrl); previewObjectUrl=''; showProfilePhoto(''); $('editor-form').reset(); letterOptions(); directionLabel(); $('item-id').value = ''; $('save').textContent = 'Pubblica contenuto'; updatePrivacy(); }
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
        for (const item of catalog.filter(x => [x.autori,x.tema,x.editore,x.isbn,x.nome,x.incarico,x.titolo,x.data,x.destinatario,x.mittente,x.direzione,x.materia,x.fascicolo,x.stato_invio,x.esito,x.descrizione,x.fonte].join(' ').toLocaleLowerCase('it').includes(query)).sort((a, b) => String(b.data).localeCompare(String(a.data)))) {
            const el = document.createElement('article');
            el.className = 'editor-entry';
            const meta = document.createElement('div');
            meta.className = 'meta';
            meta.textContent = [item.data, kind==='lettere'?(item.direzione==='entrata'?'Ricevuta':item.direzione==='uscita'?'Inviata':'Direzione da verificare'): '', kind === 'stampa' ? item.fonte : isPdf() ? 'Anno ' + item.anno : item.luogo].filter(Boolean).join(' · ');
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
        if(kind === 'cultura') { for(const k of bookFields) $('book-'+k).value=x[k]??''; $('save').textContent='Salva modifiche'; $('form-heading').scrollIntoView({behavior:'smooth',block:'start'}); return; }
        if(kind === 'profili') { if(x.foto) showProfilePhoto('https://raw.githubusercontent.com/'+encodeURIComponent(session.owner)+'/'+encodeURIComponent(session.repo)+'/'+encodeURIComponent(session.branch)+'/pubblicazioni/profili/'+encodeURIComponent(x.id)+'/'+encodeURIComponent(x.foto)); $('profile-end').value=x.data_fine||''; $('profile-start').value=x.data_nomina||''; $('profile-name').value=x.nome||''; $('profile-role').value=x.incarico||''; $('profile-bio').value=x.testo||''; $('profile-contact').value=x.contatto||''; $('profile-lead').checked=!!x.coordinamento; $('profile-board').checked=!!x.direttivo; $('profile-council').checked=!!x.consiglio; $('profile-order').value=x.ordine||10; $('save').textContent='Salva modifiche'; $('form-heading').scrollIntoView({behavior:'smooth',block:'start'}); return; }
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
            $('doc-category').value = x.categoria || 'comunicato'; $('doc-description').value = x.descrizione || ''; if (kind === 'lettere') { $('letter-direction').value=x.direzione||''; directionLabel(); $('letter-recipient').value=x.mittente||x.destinatario||''; $('letter-protocol').value=x.protocollo||''; $('letter-date').value=x.data_trasmissione||''; $('letter-topic').value=x.materia||''; $('letter-case').value=x.fascicolo||''; letterOptions(letterId(x)); $('letter-related').value=x.collegata_a||''; $('letter-channel').value=x.modalita_invio||''; $('letter-state').value=x.stato_invio||''; $('letter-outcome').value=x.esito_testo||'Non definito'; }


        }
        $('save').textContent = 'Salva modifiche';
        $('form-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    async function publish() { privacyCheck(); for(const el of $('editor-form').querySelectorAll('input[type=text], input:not([type]), textarea')) { if(!el.closest('.hidden')) scanText(el.value); } if (!sha) throw new Error('Archivio non caricato: premi Aggiorna.');
        const id = clean($('item-id').value);
        const old = id ? catalog.find(x => itemKey(x) === id) : null;
        if (id && !old)
            throw new Error('La voce da modificare non esiste più. Aggiorna elenco.');
        if(kind === 'cultura') { const book={...old,id:old?.id||'libro-'+crypto.randomUUID()}; for(const k of bookFields) book[k]=clean($('book-'+k).value); if(!book.titolo||!book.autori||!$('book-approved').checked) throw new Error('Indica titolo, autori e conferma autorizzazione.'); book.ordine=Number(book.ordine)||10; for(const k of ['link_editore','link_pubblicazione']) if(book[k]&&!safeUrl(book[k])) throw new Error('Usa link HTTPS validi.'); const photo=$('book-cover').files[0]; if(photo){ if(photo.size<12||photo.size>5*1024*1024) throw new Error('Copertina non valida o superiore a 5 MB.'); const bytes=new Uint8Array(await photo.arrayBuffer()); const ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b)); const ext=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'jpg':[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)?'png':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'?'webp':''; if(!ext) throw new Error('Formato copertina non valido.'); const bitmap=await createImageBitmap(photo); bitmap.close(); if(!/^[a-zA-Z0-9_-]+$/.test(book.id)) throw new Error('ID libro non valido.'); book.copertina='copertina-'+crypto.randomUUID()+'.'+ext; book.versione=Date.now().toString(); await stageFile('pubblicazioni/cultura/'+book.id+'/'+book.copertina,toBase64(bytes)); } await save(old?catalog.map(x=>x.id===old.id?book:x):[...catalog,book],'Aggiorna libro '+book.titolo); resetForm(); status('Libro salvato in GitHub.'); return; }
        if(kind === 'profili') { const nome=clean($('profile-name').value), incarico=clean($('profile-role').value), coordinamento=$('profile-lead').checked,direttivo=$('profile-board').checked,consiglio=$('profile-council').checked; if(!nome||!incarico||!(coordinamento||direttivo||consiglio)||!$('profile-approved').checked) throw new Error('Compila nome, incarico, appartenenza e conferma pubblicabilità.'); const person={...old,id:old?.id||'profilo-'+crypto.randomUUID(),nome,incarico,coordinamento,direttivo,consiglio,ordine:Number($('profile-order').value)||10,testo:clean($('profile-bio').value),contatto:clean($('profile-contact').value),allegati:old?.allegati||[],data_nomina:$('profile-start').value,data_fine:$('profile-end').value}; if(person.data_nomina && person.data_fine && person.data_fine < person.data_nomina) throw new Error('La fine incarico precede la nomina.'); const photo=$('profile-photo').files[0]; if(photo){ if(photo.size<12||photo.size>5*1024*1024) throw new Error('Foto non valida o superiore a 5 MB.'); const bytes=new Uint8Array(await photo.arrayBuffer()); const ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b)); const ext=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'jpg':[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)?'png':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'?'webp':''; if(!ext) throw new Error('Formato foto non valido.'); const bitmap=await createImageBitmap(photo); bitmap.close(); if(!/^[a-zA-Z0-9_-]+$/.test(person.id)) throw new Error('Identificativo profilo non valido.'); person.foto='foto-'+crypto.randomUUID()+'.'+ext; person.foto_versione=Date.now().toString(); await stageFile('pubblicazioni/profili/'+person.id+'/'+person.foto,toBase64(bytes)); } await save(old?catalog.map(x=>x.id===old.id?person:x):[...catalog,person],'Aggiorna profilo '+nome); resetForm(); status('Profilo salvato in GitHub.'); return; }
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
                await stageFile('assets/' + foto,toBase64(bytes));
            }
            if (foto && !/^[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(foto))
                throw new Error('Nome foto non valido.');
            Object.assign(next, { luogo, tipo: $('event-type').value, descrizione: clean($('event-description').value), foto, link: url ? safeUrl(url) : '' });
        }
        if (isPdf()) {
            if (!$('privacy-review').checked || !$('privacy-redacted').checked)
                throw new Error('Per pubblicare il documento devi confermare sia l’approvazione del coordinamento sia la verifica della privacy.');
            if (kind === 'lettere') { const direzione=$('letter-direction').value, party=clean($('letter-recipient').value), data_trasmissione=$('letter-date').value, materia=$('letter-topic').value, stato_invio=$('letter-state').value, collegata_a=$('letter-related').value; if(!['entrata','uscita'].includes(direzione)||!party||!data_trasmissione||!materia||!stato_invio||!clean($('doc-description').value)) throw new Error('Completa direzione, ente, data, materia, stato e descrizione.'); if(collegata_a && !catalog.some(x=>letterId(x)===collegata_a && (!old||letterId(x)!==letterId(old)))) throw new Error('Collegamento non valido.'); Object.assign(next,{id:old?letterId(old):'lettera-'+crypto.randomUUID(),direzione,data_trasmissione,materia,stato_invio,collegata_a,fascicolo:clean($('letter-case').value),modalita_invio:$('letter-channel').value,esito_testo:$('letter-outcome').value,protocollo:clean($('letter-protocol').value),destinatario:direzione==='uscita'?party:'',mittente:direzione==='entrata'?party:''}); }
            if(kind === 'documenti') next.categoria = $('doc-category').value;
            next.anno = data.slice(0, 4);
            next.descrizione = clean($('doc-description').value);
            next.pubblica = true;
            next.verifica_privacy = true; next.data_verifica_privacy = new Date().toISOString();
            const files = Array.from($('document-file').files);
            if (!files.length && !old) throw new Error('Seleziona un PDF o DOCX.');
            if(old && String(old.anno)!==next.anno) throw new Error('La data deve restare nello stesso anno del documento archiviato.');
            const prepared = [];
            for(const file of files){
                const ext = file.name.split('.').pop().toLowerCase();
                if(!['pdf','docx'].includes(ext)||file.size<5||file.size>5*1024*1024||prepared.some(x=>x.ext===ext)) throw new Error('Massimo un PDF e un DOCX, ciascuno entro 5 MB.');
                const bytes = new Uint8Array(await file.arrayBuffer());
                const raw = new TextDecoder('latin1').decode(bytes);
                if(ext==='pdf'){
                    if(!raw.startsWith('%PDF-')) throw new Error('PDF non valido.');
                    scanText(raw);
                    if(/\/(Encrypt|EmbeddedFiles?|JavaScript|JS|Launch|RichMedia|XFA|ByteRange)\b/.test(raw)) throw new Error('PDF con indicatori di rischio: prepara una copia pubblicabile.');
                } else {
                    if(bytes[0]!==80||bytes[1]!==75||bytes[2]!==3||bytes[3]!==4||!raw.includes('[Content_Types].xml')||!raw.includes('word/document.xml')) throw new Error('DOCX non riconosciuto.');
                    if(/vbaProject|vbaData|word\/embeddings\/|word\/activeX\/|word\/comments|_xmlsignatures/i.test(raw)) throw new Error('DOCX con indicatori di macro, commenti, firma o allegati: prepara una copia pulita.');
                }
                prepared.push({ext,bytes});
            }
            const formats = {};
            if(old){for(const name of [old.file,old.file_alternativo]) if(typeof name==='string'&&/^[\w.-]+\.(pdf|docx)$/i.test(name)) formats[name.split('.').pop().toLowerCase()]=name;}
            for(const {ext,bytes} of prepared){
                const name=(kind==='lettere'?'lettera-':'comunicato-')+'-'+data+'-'+crypto.randomUUID()+'.'+ext;
                const path=(kind==='lettere'?'lettere/':'documenti/')+next.anno+'/'+name;
                status('Carico il documento '+ext.toUpperCase()+' nel repository…');
                await stageFile(path,toBase64(bytes));
                formats[ext]=name;
            }
            next.file=formats.pdf||formats.docx;
            if(formats.pdf&&formats.docx) next.file_alternativo=formats.docx; else delete next.file_alternativo;
            if(!next.file) throw new Error('Documento mancante.');

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
            updatePrivacy(); status('Accesso riuscito. Puoi gestire contenuti e documenti.');
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
    $('profile-photo').addEventListener('change',()=>{const f=$('profile-photo').files[0]; if(!f)return; if(f.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(f.type)){ $('profile-photo').value=''; status('Scegli una fotografia JPEG, PNG o WebP fino a 5 MB.',true);return;} if(previewObjectUrl) URL.revokeObjectURL(previewObjectUrl); previewObjectUrl=URL.createObjectURL(f); showProfilePhoto(previewObjectUrl);});
    $('letter-direction').addEventListener('change',directionLabel);
    $('archive-search').addEventListener('input', render);
    $('cancel').addEventListener('click', resetForm);
    function invalidatePrivacy(e){if(!e.target.closest('#privacy-gate') && e.target.matches('input,select,textarea')){ $('privacy-review').checked=false; $('privacy-redacted').checked=false; $('privacy-pdf-manual').checked=false; $('privacy-result').value=''; $('publish-status').textContent=''; } updatePrivacy();}
    $('editor-form').addEventListener('input',invalidatePrivacy);
    $('editor-form').addEventListener('change',invalidatePrivacy);
    updatePrivacy();
    $('editor-form').addEventListener('invalid',()=>{const el=$('publish-status');el.textContent='Completa i campi obbligatori indicati nel modulo.';el.style.color='#a12626';},true);
    $('editor-form').addEventListener('submit', async event => {
        event.preventDefault(); if(busy)return;
        const button=$('save'), original=button.textContent;
        publishing=true; pendingFiles=[];
        button.textContent='Pubblicazione in corso…';
        const controls=[...$('editor-form').querySelectorAll('input,select,textarea')].filter(el=>!el.disabled);
        controls.forEach(el=>el.disabled=true);
        status('Verifica e preparazione del contenuto…');
        try { await withBusy(publish); }
        finally { controls.forEach(el=>el.disabled=false); pendingFiles=null; publishing=false; if(button.textContent==='Pubblicazione in corso…')button.textContent=original; updatePrivacy(); }
    });
})();
