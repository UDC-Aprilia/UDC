/* Gestione interamente statica. Credenziali solo in memoria, mai su disco/localStorage. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let session = null, catalog = [], catalogSha = null, busy = false;
  const status = (text, error=false) => { $('status').textContent = text; $('status').classList.toggle('error',error); };
  const escapeText = s => String(s ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const validName = s => /^[a-zA-Z0-9_.-]+$/.test(s) && !s.startsWith('.');
  const api = path => `https://api.github.com/repos/${encodeURIComponent(session.owner)}/${encodeURIComponent(session.repo)}/contents/${path}`;
  const encode64 = bytes => { let output=''; for(let i=0;i<bytes.length;i+=8192) output += String.fromCharCode(...bytes.subarray(i,i+8192)); return btoa(output); };
  const json64 = value => encode64(new TextEncoder().encode(JSON.stringify(value,null,2)+'\n'));
  async function request(url, method='GET', data=null) {
    const response = await fetch(url, {method, headers: {
      'Accept':'application/vnd.github+json','Authorization':`Bearer ${session.token}`,
      'X-GitHub-Api-Version':'2022-11-28',...(data?{'Content-Type':'application/json'}:{})
    }, ...(data?{body:JSON.stringify(data)}:{}), cache:'no-store'});
    let body; try {body=await response.json();} catch {body={};}
    if(!response.ok) {
      const msg = response.status===401?'Token non valido o scaduto':response.status===403?'Permessi insufficienti oppure limite di richieste GitHub':response.status===404?'Repository, branch o file non trovato: verifica nome e autorizzazioni':response.status===409?'Conflitto di versione: aggiorna la pagina e riprova':(body.message||`Errore HTTP ${response.status}`);
      throw new Error(msg);
    }
    return body;
  }
  const fileApi = (path) => api(path.split('/').map(encodeURIComponent).join('/'));
  async function readCatalog() {
    const result=await request(fileApi('data/foto.json')+'?ref='+encodeURIComponent(session.branch));
    if (typeof result.content !== 'string') throw new Error('Il catalogo fotografico non è leggibile.');
    const bytes=Uint8Array.from(atob(result.content.replace(/\s/g,'')),c=>c.charCodeAt(0));
    const loaded=JSON.parse(new TextDecoder().decode(bytes));
    if(!Array.isArray(loaded) || !loaded.every(x=>x && typeof x.file==='string' && typeof x.titolo==='string')) throw new Error('Formato archivio non valido.');
    catalog=loaded; catalogSha=result.sha; renderList();
  }
  async function saveCatalog(next, message) {
    const result=await request(fileApi('data/foto.json'),'PUT',{message,content:json64(next),sha:catalogSha,branch:session.branch});
    catalogSha=result.content.sha;catalog=next;renderList();
  }
  async function runBusy(operation) {
    if(busy) return;
    busy=true; document.querySelectorAll('#editor button,#library button').forEach(b=>b.disabled=true);
    try {await operation();}catch(e){status('Errore: '+e.message,true);}finally{busy=false;document.querySelectorAll('#editor button,#library button').forEach(b=>b.disabled=false);}
  }
  function renderList() {
    const node=$('items');node.textContent='';
    if(!catalog.length){node.textContent='Nessuna fotografia pubblicata.';return;}
    for (const photo of catalog) {
      const el=document.createElement('article');el.className='item';
      const img=document.createElement('img');img.src='assets/'+encodeURIComponent(photo.file);img.alt=photo.titolo;img.loading='lazy';el.append(img);
      const label=document.createElement('label');label.textContent='Didascalia';
      const input=document.createElement('input');input.value=photo.titolo;input.maxLength=160;label.append(input);el.append(label);
      const bar=document.createElement('div');bar.className='buttons';
      const save=document.createElement('button');save.type='button';save.textContent='Salva';
      save.addEventListener('click',()=>runBusy(async()=>{
        const next=catalog.map(p=>p.file===photo.file?{...p,titolo:input.value.trim()||'Fotografia UDC Aprilia'}:p);
        await saveCatalog(next,'Aggiorna didascalia fotografia');status('Didascalia aggiornata. Sarà visibile dopo la pubblicazione GitHub Pages.');
      }));
      const remove=document.createElement('button');remove.type='button';remove.className='danger';remove.textContent='Rimuovi';
      remove.addEventListener('click',()=>{
        if(!window.confirm('Rimuovere questa fotografia dalla galleria e dalla Home? Il file resterà nel repository.'))return;
        runBusy(async()=>{await saveCatalog(catalog.filter(p=>p.file!==photo.file),'Rimuovi fotografia dalla galleria');status('Fotografia rimossa dalla galleria. Il file originale rimane nel repository.');});
      });
      bar.append(save,remove);el.append(bar);node.append(el);
    }
  }
  $('connect').addEventListener('click',async()=>{
    const owner=$('owner').value.trim(), repo=$('repo').value.trim(),branch=$('branch').value.trim(),token=$('token').value.trim();
    if(!validName(owner)||!validName(repo)||!branch||!token){status('Compila proprietario, repository, branch e token validi.',true);return;}
    $('connect').disabled=true;session={owner,repo,branch,token};status('Verifico il collegamento…');
    try {
      await readCatalog();
      $('token').value=''; // Il token rimane solo nella variabile volatile della scheda.
      $('login-panel').classList.add('hidden');$('editor').classList.remove('hidden');$('library').classList.remove('hidden');
      status('Accesso riuscito. Archivio caricato: '+catalog.length+' fotografie.');
    } catch(e) {session=null;status('Impossibile accedere: '+e.message,true);}finally{$('connect').disabled=false;}
  });
  $('logout').addEventListener('click',()=>{session=null;catalog=[];catalogSha=null;$('login-panel').classList.remove('hidden');$('editor').classList.add('hidden');$('library').classList.add('hidden');$('token').value='';$('items').textContent='';status('Disconnesso. Token eliminato dalla memoria della pagina.');});
  $('refresh').addEventListener('click',()=>runBusy(async()=>{await readCatalog();status('Elenco aggiornato.');}));
  $('photos').addEventListener('change',()=>{
    const list=$('previews');list.textContent='';
    for(const file of [...$('photos').files].slice(0,10)){
      const item=document.createElement('div');item.className='preview';const img=document.createElement('img');const url=URL.createObjectURL(file);
      img.src=url;img.onload=()=>URL.revokeObjectURL(url);const cap=document.createElement('span');cap.textContent=file.name;item.append(img,cap);list.append(item);
    }
  });
  const optimize = file => new Promise((resolve,reject)=>{
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)) return reject(new Error('Formato non supportato: '+file.name));
    if(file.size>25*1024*1024) return reject(new Error('Immagine troppo grande: massimo 25 MB in ingresso.'));
    const img=new Image(), object=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(object);
      const scale=Math.min(1,1800/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      const ctx=canvas.getContext('2d');if(!ctx)return reject(new Error('Ottimizzazione immagini non disponibile.'));
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
      canvas.toBlob(async blob=>{if(!blob)return reject(new Error('Impossibile convertire la fotografia.'));try{resolve(new Uint8Array(await blob.arrayBuffer()));}catch(e){reject(e);}},'image/jpeg',0.82);
    };
    img.onerror=()=>{URL.revokeObjectURL(object);reject(new Error('Immagine non leggibile: '+file.name));};img.src=object;
  });
  $('upload').addEventListener('submit',event=>{
    event.preventDefault();const files=[...$('photos').files];
    if(!files.length||files.length>10){status('Seleziona da 1 a 10 fotografie.',true);return;}
    runBusy(async()=>{
      // Per evitare di perdere file caricati in caso di errore, aggiorna il catalogo
      // dopo ogni singolo upload, poi rilegge il SHA aggiornato.
      for(let i=0;i<files.length;i++){
        const file=files[i];status(`Caricamento ${i+1}/${files.length}: ${file.name}`);
        const bytes=await optimize(file);
        const basename='foto-'+new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,9)+'.jpg';
        await request(fileApi('assets/'+basename),'PUT',{message:'Aggiungi fotografia '+basename,content:encode64(bytes),branch:session.branch});
        await readCatalog();
        const title=$('caption').value.trim()||file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').slice(0,160)||'Fotografia UDC Aprilia';
        await saveCatalog([...catalog,{file:basename,titolo:title}],'Pubblica nuova fotografia in galleria');
      }
      $('upload').reset();$('previews').textContent='';status(files.length+' fotografie pubblicate nel repository. Appariranno sul sito dopo il deploy di GitHub Pages.');
    });
  });
})();
