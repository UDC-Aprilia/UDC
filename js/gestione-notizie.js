/* Client editoriale statico: token mai persistito, richieste dirette a GitHub API. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const cfg={stampa:{path:'data/stampa.json',name:'Rassegna stampa'},attivita:{path:'data/attivita.json',name:'Attività ed eventi'},documenti:{path:'data/documenti.json',name:'Comunicati PDF'}};
 let session=null,kind='stampa',catalog=[],sha=null,busy=false;
 const status=(message,error=false)=>{$('status').textContent=message;$('status').classList.toggle('error',error);};
 const clean=s=>String(s||'').trim();
 const validRepo=s=>/^[a-zA-Z0-9_.-]{1,100}$/.test(s)&&!s.startsWith('.');
 const safeUrl=s=>{try{const u=new URL(clean(s));return u.protocol==='https:'?u.href:'';}catch{return '';}};
 const fileApi=path=>`https://api.github.com/repos/${encodeURIComponent(session.owner)}/${encodeURIComponent(session.repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
 const toBase64=bytes=>{let output='';for(let i=0;i<bytes.length;i+=8192)output+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(output);};
 const json64=x=>toBase64(new TextEncoder().encode(JSON.stringify(x,null,2)+'\n'));
 async function request(url,method='GET',data){
  const r=await fetch(url,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+session.token,'X-GitHub-Api-Version':'2022-11-28',...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{}),cache:'no-store'});
  let result={};try{result=await r.json();}catch{}
  if(!r.ok)throw new Error(r.status===401?'Credenziale errata o scaduta':r.status===403?'Permessi GitHub insufficienti o limite API':r.status===404?'Repository, branch o file non trovato':r.status===409?'Conflitto: ricarica e riprova':(result.message||'HTTP '+r.status));
  return result;
 }
 async function load(){const result=await request(fileApi(cfg[kind].path)+'?ref='+encodeURIComponent(session.branch));
  if(typeof result.content!=='string')throw new Error('Archivio non leggibile');const bytes=Uint8Array.from(atob(result.content.replace(/\s/g,'')),c=>c.charCodeAt(0));const data=JSON.parse(new TextDecoder().decode(bytes));if(!Array.isArray(data))throw new Error('Archivio non valido');catalog=data;sha=result.sha;render();}
 async function save(next,action){const response=await request(fileApi(cfg[kind].path),'PUT',{message:action,content:json64(next),sha,branch:session.branch});sha=response.content.sha;catalog=next;render();}
 async function withBusy(fn){if(busy)return;busy=true;document.querySelectorAll('#workspace button').forEach(b=>b.disabled=true);try{await fn();}catch(e){status('Errore: '+e.message,true);}finally{busy=false;document.querySelectorAll('#workspace button').forEach(b=>b.disabled=false);}}
 function switchKind(next){kind=next;resetForm();document.querySelectorAll('.tab').forEach(t=>{const active=t.dataset.kind===kind;t.classList.toggle('active',active);t.setAttribute('aria-pressed',String(active));});for(const key of Object.keys(cfg))$(key+'-fields').classList.toggle('hidden',kind!==key);$('form-heading').textContent=kind==='stampa'?'3. Nuovo articolo di stampa':kind==='attivita'?'3. Nuova attività o evento':'3. Nuovo comunicato ufficiale PDF';$('form-help').textContent=kind==='stampa'?'Articoli esterni: breve sintesi, testata e collegamento verificato.':kind==='attivita'?'Distingui un evento organizzato da UDC da una semplice partecipazione.':'Carica documenti ufficiali approvati in formato PDF.';}
 function resetForm(){$('editor-form').reset();$('item-id').value='';$('save').textContent='Pubblica contenuto';}
 function render(){const target=$('listing');target.replaceChildren();if(!catalog.length){const msg=document.createElement('div');msg.className='empty-editor';msg.textContent='Nessun contenuto pubblicato in questa sezione.';target.append(msg);return;}
  for(const item of [...catalog].sort((a,b)=>String(b.data).localeCompare(String(a.data)))){
   const el=document.createElement('article');el.className='editor-entry';const meta=document.createElement('div');meta.className='meta';meta.textContent=[item.data,kind==='stampa'?item.fonte:kind==='documenti'?'Anno '+item.anno:item.luogo].filter(Boolean).join(' · ');
   const title=document.createElement('h3');title.textContent=item.titolo;const desc=document.createElement('p');desc.textContent=item.testo||item.descrizione||'';
   const actions=document.createElement('div');actions.className='actions';const edit=document.createElement('button');edit.className='secondary';edit.type='button';edit.textContent='Modifica';edit.addEventListener('click',()=>editItem(item));
   const remove=document.createElement('button');remove.className='danger';remove.type='button';remove.textContent='Rimuovi';remove.addEventListener('click',()=>{if(!confirm('Rimuovere “'+item.titolo+'” dal sito pubblico?'))return;withBusy(async()=>{await save(catalog.filter(x=>x.id!==item.id),'Rimuovi contenuto '+item.id);status('Contenuto rimosso dal catalogo.');});});actions.append(edit,remove);el.append(meta,title,desc,actions);target.append(el);
  }
 }
 function editItem(x){resetForm();$('item-id').value=x.id;$('title').value=x.titolo;$('date').value=x.data;
  if(kind==='stampa'){$('source').value=x.fonte||'';$('press-url').value=x.link||'';$('summary').value=x.testo||'';}
  if(kind==='attivita'){$('place').value=x.luogo||'';$('event-type').value=x.tipo||'partecipazione';$('event-description').value=x.descrizione||'';$('event-url').value=x.link||'';$('event-photo').value=x.foto||'';}
  if(kind==='documenti'){$('doc-description').value=x.descrizione||'';}
  $('save').textContent='Salva modifiche';$('form-heading').scrollIntoView({behavior:'smooth',block:'start'});
 }
 async function publish(){const id=clean($('item-id').value);const old=id?catalog.find(x=>x.id===id):null;if(id&&!old)throw new Error('La voce da modificare non esiste più. Aggiorna elenco.');const titolo=clean($('title').value),data=$('date').value;
  if(!titolo||!/^\d{4}-\d{2}-\d{2}$/.test(data))throw new Error('Indica titolo e data validi.');
  const next={id:old?.id||'item-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),data,titolo};
  if(kind==='stampa') {const fonte=clean($('source').value),link=safeUrl($('press-url').value);if(!fonte||!link)throw new Error('Indica la testata e un URL HTTPS valido.');Object.assign(next,{fonte,link,testo:clean($('summary').value)});}
  if(kind==='attivita'){const luogo=clean($('place').value),url=clean($('event-url').value),foto=clean($('event-photo').value);if(!luogo)throw new Error('Indica il luogo.');if(url&&!safeUrl(url))throw new Error('Il link deve essere HTTPS.');if(foto&&!/^[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(foto))throw new Error('Nome foto non valido.');Object.assign(next,{luogo,tipo:$('event-type').value,descrizione:clean($('event-description').value),foto,link:url?safeUrl(url):''});}
  if(kind==='documenti'){
   next.anno=data.slice(0,4);next.descrizione=clean($('doc-description').value);const file=$('document-file').files[0];
   if(!file&&!old)throw new Error('Seleziona un PDF da caricare.');
   if(file){if(!/\.pdf$/i.test(file.name)||file.size<5||file.size>5*1024*1024)throw new Error('Serve un PDF valido e non superiore a 5 MB.');const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('Il file selezionato non è un PDF valido.');
    const name='comunicato-'+data+'-'+Math.random().toString(36).slice(2,9)+'.pdf';const path='documenti/'+next.anno+'/'+name;
    status('Carico il documento PDF nel repository…');await request(fileApi(path),'PUT',{message:'Carica comunicato ufficiale '+name,content:toBase64(bytes),branch:session.branch});next.file=name;
   } else {if(old.anno!==next.anno)throw new Error('Per cambiare anno a un PDF già pubblicato carica nuovamente il file.');next.file=old.file;}
  }
  const replacement=old?catalog.map(x=>x.id===old.id?next:x):[...catalog,next];
  await save(replacement,(old?'Aggiorna':'Pubblica')+' '+cfg[kind].name+' '+titolo.slice(0,70));resetForm();status('Contenuto salvato in GitHub. Sarà visibile dopo la pubblicazione di GitHub Pages.');
 }
 $('connect').addEventListener('click',async()=>{const owner=clean($('owner').value),repo=clean($('repo').value),branch=clean($('branch').value),token=clean($('token').value);
  if(!validRepo(owner)||!validRepo(repo)||!branch||!token){status('Indica proprietario, repository, branch e token validi.',true);return;}session={owner,repo,branch,token};$('connect').disabled=true;try{await load();$('token').value='';$('login-panel').classList.add('hidden');$('workspace').classList.remove('hidden');status('Accesso riuscito. Puoi gestire contenuti e documenti.');}catch(e){session=null;status('Accesso non riuscito: '+e.message,true);}finally{$('connect').disabled=false;}
 });
 $('logout').addEventListener('click',()=>{session=null;catalog=[];sha=null;$('workspace').classList.add('hidden');$('login-panel').classList.remove('hidden');$('token').value='';status('Sessione terminata.');});
 document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>withBusy(async()=>{switchKind(t.dataset.kind);await load();status('Archivio '+cfg[kind].name+' caricato.');})));
 $('refresh').addEventListener('click',()=>withBusy(async()=>{await load();status('Elenco aggiornato.');}));
 $('cancel').addEventListener('click',resetForm);
 $('editor-form').addEventListener('submit',event=>{event.preventDefault();withBusy(publish);});
})();
