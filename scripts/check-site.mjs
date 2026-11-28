import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
let errors=0;
function fail(msg){console.error(msg);errors++;}
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')||e.name==='node_modules'?[]:e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);}
for(const file of walk('.')){
 if(/\.m?js$/.test(file)){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0)fail(file+': '+r.stderr);}
 if(file.endsWith('.json')){try{JSON.parse(readFileSync(file,'utf8'));}catch(e){fail(file+': '+e.message);}}
 if(file.endsWith('.html')){const html=readFileSync(file,'utf8');for(const m of html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)){const url=m[1];if(/^(?:[a-z]+:|\/\/|#)/i.test(url))continue;const target=url.split(/[?#]/)[0];if(target&&!existsSync(target.startsWith('/')?'.'+target:join(dirname(file),target)))fail(file+': risorsa mancante '+target);}}
}
if(errors)process.exitCode=1;else console.log('Controlli statici superati');
