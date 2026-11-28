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
} finally {await browser.close();}
console.log('Controlli browser superati');
