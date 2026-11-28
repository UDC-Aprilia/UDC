import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 for(const viewport of [{width:1600,height:900},{width:1280,height:900},{width:1024,height:768},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  for(const path of ['index.html','eventi.html']){
   await page.goto('http://127.0.0.1:8000/'+path);
   const search=page.locator('[data-global-search]');
   await search.waitFor({state:'visible'});
   assert.equal(await search.count(),1);
   assert.equal(await search.evaluate(el=>el.nextElementSibling.matches(innerWidth>=1161?'.national':'.toggle')),true);
   assert.equal(await search.locator('.global-search-label').isVisible(),viewport.width>=1400);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await search.click();
   const dialog=page.locator('#global-search');
   await dialog.waitFor({state:'visible'});
   await dialog.locator('#global-query').fill('UDC');
   await dialog.locator('button[type=submit]').click();
   await dialog.locator('#global-results article').first().waitFor({state:'visible'});
   assert.equal(new URL(page.url()).pathname,'/'+path);
   await dialog.locator('#global-close').click();
   await dialog.waitFor({state:'hidden'});
   await page.locator('[data-global-search]').click();
   await dialog.locator('#global-results article').first().waitFor({state:'visible'});
   await dialog.locator('#global-close').click();
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
 const admin=await browser.newPage();
 const errors=[];
 admin.on('pageerror',e=>errors.push(e.message));
 let writes=0, allowWrite=false, committed=false, conflict=false; const methods=[];
 await admin.route('https://api.github.com/**',async route=>{
  const method=route.request().method(); const pathname=new URL(route.request().url()).pathname;
  if(method!=='GET'){writes++;if(!allowWrite)return route.abort();methods.push(method+' '+pathname.split('/git/')[1]);const body=route.request().postDataJSON();if(method==='PATCH'){assert.equal(body.force,false);committed=true;}return route.fulfill({json:{sha:'mock-sha'},headers:{'access-control-allow-origin':'*'}});}
  if(pathname.includes('/git/ref/'))return route.fulfill({json:{object:{sha:'parent'}},headers:{'access-control-allow-origin':'*'}});
  if(pathname.includes('/git/commits/'))return route.fulfill({json:{tree:{sha:'base-tree'}},headers:{'access-control-allow-origin':'*'}});
  const url=new URL(route.request().url());
  const file=url.pathname.split('/contents/')[1];
  if(!file)return route.abort();
  const {readFileSync}=await import('node:fs');
  const content=readFileSync(file).toString('base64');
  await route.fulfill({json:{content,sha:conflict&&url.searchParams.get('ref')==='parent'?'changed-sha':'test-sha'},headers:{'access-control-allow-origin':'*'}});
 });
 await admin.goto('http://127.0.0.1:8000/gestione-notizie.html');
 await admin.locator('#token').fill('token-fittizio-test');
 await admin.locator('#connect').click();
 await admin.locator('#workspace').waitFor({state:'visible'});
 for(const kind of ['stampa','attivita','documenti','cultura','profili','lettere']){
  await admin.locator('[data-kind="'+kind+'"]').click();
  await admin.waitForFunction(()=>document.querySelector('#refresh').disabled===false);
  assert.equal(await admin.locator('#save').isDisabled(),true);
  await admin.locator('#privacy-review').check();
  await admin.locator('#privacy-redacted').check();
  await admin.locator('#privacy-result').selectOption('clear');
  assert.equal(await admin.locator('#save').isEnabled(),true);
  await admin.locator('#cancel').click();
  assert.equal(await admin.locator('#save').isDisabled(),true);
 }
 assert.equal(writes,0);
 await admin.locator('[data-kind="stampa"]').click();
 await admin.waitForFunction(()=>!document.querySelector('#refresh').disabled);
 await admin.locator('#title').fill('Test fittizio automatico');
 await admin.locator('#date').fill('2026-11-28');
 await admin.locator('#source').fill('Test');
 await admin.locator('#press-url').fill('https://example.org/test');
 await admin.locator('#privacy-review').check();
 await admin.locator('#privacy-redacted').check();
 await admin.locator('#privacy-result').selectOption('clear');
 allowWrite=true;
 await admin.locator('#save').click();
 await admin.waitForFunction(()=>document.querySelector('#publish-status').textContent.includes('GitHub'));
 assert.equal(committed,true);
 assert.deepEqual(methods,['POST blobs','POST trees','POST commits','PATCH refs/heads/main']);
 await admin.locator('#refresh').click();
 await admin.waitForFunction(()=>!document.querySelector('#refresh').disabled);
 await admin.locator('#title').fill('Test conflitto automatico');
 await admin.locator('#date').fill('2026-11-28');
 await admin.locator('#source').fill('Test');
 await admin.locator('#press-url').fill('https://example.org/conflict');
 await admin.locator('#privacy-review').check();
 await admin.locator('#privacy-redacted').check();
 await admin.locator('#privacy-result').selectOption('clear');
 conflict=true;
 const before=writes;
 await admin.locator('#save').click();
 await admin.waitForFunction(()=>document.body.textContent.includes('Archivio modificato da un altro utente'));
 assert.equal(writes,before,'Un conflitto non deve produrre scritture');
 conflict=false;
 await admin.locator('[data-kind="attivita"]').click();
 await admin.waitForFunction(()=>!document.querySelector('#refresh').disabled);
 await admin.locator('#title').fill('Evento fittizio con foto');
 await admin.locator('#date').fill('2026-11-28');
 await admin.locator('#place').fill('Luogo di prova');
 await admin.locator('#event-photo-file').setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from(await admin.evaluate(()=>{const c=document.createElement('canvas');c.width=16;c.height=16;const ctx=c.getContext('2d');ctx.fillStyle='#888';ctx.fillRect(0,0,16,16);return c.toDataURL('image/png').split(',')[1]}),'base64')});
 await admin.locator('#event-photo-approved').check();
 await admin.locator('#privacy-review').check();
 await admin.locator('#privacy-redacted').check();
 await admin.locator('#privacy-result').selectOption('clear');
 methods.length=0; committed=false;
 await admin.locator('#save').click();
 await admin.waitForFunction(()=>!document.querySelector('#refresh').disabled);
 assert.match(await admin.locator('#publish-status').innerText(),/Contenuto salvato in GitHub/);
 assert.equal(committed,true);
 assert.deepEqual(methods,['POST blobs','POST blobs','POST trees','POST commits','PATCH refs/heads/main']);
 await admin.locator('[data-kind="documenti"]').click();
 await admin.waitForFunction(()=>!document.querySelector('#refresh').disabled);
 await admin.locator('#title').fill('Documento fittizio di prova');
 await admin.locator('#date').fill('2026-11-28');
 await admin.locator('#doc-description').fill('Allegati sintetici per collaudo');
 const {execFileSync}=await import('node:child_process');
 const docx=execFileSync('python3',['-c',`import io,zipfile,sys
b=io.BytesIO()
with zipfile.ZipFile(b,'w') as z:
 z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
 z.writestr('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
 z.writestr('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Test</w:t></w:r></w:p></w:body></w:document>')
sys.stdout.buffer.write(b.getvalue())`]);
 const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n%%EOF');
 await admin.locator('#document-file').setInputFiles([{name:'test.pdf',mimeType:'application/pdf',buffer:pdf},{name:'test.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:docx}]);
 await admin.locator('#privacy-review').check();
 await admin.locator('#privacy-redacted').check();
 await admin.locator('#privacy-result').selectOption('clear');
 assert.equal(await admin.locator('#save').isDisabled(),true);
 await admin.locator('#privacy-pdf-manual').check();
 methods.length=0; committed=false;
 await admin.locator('#save').click();
 await admin.waitForFunction(()=>!document.querySelector('#refresh').disabled);
 assert.match(await admin.locator('#publish-status').innerText(),/Contenuto salvato in GitHub/);
 assert.equal(committed,true);
 assert.deepEqual(methods,['POST blobs','POST blobs','POST blobs','POST trees','POST commits','PATCH refs/heads/main']);
 assert.deepEqual(errors,[]);
 await admin.close();
} finally {await browser.close();}
console.log('Controlli browser superati');
