import {readdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
const check=process.argv.includes('--check');
let changed=0;
for(const file of readdirSync('.').filter(f=>f.endsWith('.html'))){
 const old=readFileSync(file,'utf8');
 const next=old.replace(/((?:src|href)=["'])([^"'?#]+\.(?:js|css))(?:\?v=[^"'#]*)?(["'])/gi,(all,prefix,path,suffix)=>{
  if(/^(?:[a-z]+:|\/)/i.test(path))return all;
  const target=join(dirname(file),path);
  if(!existsSync(target))return all;
  const hash=createHash('sha256').update(readFileSync(target)).digest('hex').slice(0,12);
  return prefix+path+'?v='+hash+suffix;
 });
 if(next!==old){changed++;console.log(file);if(!check)writeFileSync(file,next);}
}
if(check&&changed)process.exitCode=1;
