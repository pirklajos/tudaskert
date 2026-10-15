import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../public/',import.meta.url);
const assets=readdirSync(root,{recursive:true}).filter(path=>/\.(?:html|css|js|json|webmanifest|svg|png)$/.test(path)&&!['precache.js','service-worker.js'].includes(path)).sort();
const hash=createHash('sha256');for(const path of [...assets,'service-worker.js'])hash.update(path).update(readFileSync(new URL(path,root)));
const content=`self.SHELL_CACHE = 'zorka-shell-${hash.digest('hex').slice(0,12)}';\nself.SHELL_ASSETS = ${JSON.stringify(assets.map(path=>'/'+path.replaceAll('\\','/')),null,2)};\n`;
if(process.argv.includes('--check')){if(readFileSync(new URL('precache.js',root),'utf8')!==content)throw new Error('Run node scripts/build-precache.mjs');}
else writeFileSync(new URL('precache.js',root),content);
