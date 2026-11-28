import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  for(const path of ['index.html','eventi.html']){
   await page.goto('http://127.0.0.1:8000/'+path);
   await page.locator('[data-global-search]').click();
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
 let writes=0;
 await admin.route('https://api.github.com/**',async route=>{
  if(route.request().method()!=='GET'){writes++;return route.abort();}
  const url=new URL(route.request().url());
  const file=url.pathname.split('/contents/')[1];
  if(!file)return route.abort();
  const {readFileSync}=await import('node:fs');
  const content=readFileSync(file).toString('base64');
  await route.fulfill({json:{content,sha:'test-sha'},headers:{'access-control-allow-origin':'*'}});
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
 assert.deepEqual(errors,[]);
 await admin.close();
} finally {await browser.close();}
console.log('Controlli browser superati');
