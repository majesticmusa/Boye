import {existsSync,writeFileSync} from 'node:fs';
const prod=process.env.CONTEXT==='production';
const name=prod?'conversion-funnel':'conversion-funnel-'+(process.env.DEPLOY_ID||'dev');
const url=(prod?process.env.URL:process.env.DEPLOY_PRIME_URL)||'';
writeFileSync(new URL('./server/deployment.mjs',import.meta.url),'export const storeName='+JSON.stringify(name)+';\nexport const siteUrl='+JSON.stringify(url)+';\n');

const hasAsset=name=>existsSync(new URL('./public/media/'+name,import.meta.url));
writeFileSync(new URL('./public/video-settings.mjs',import.meta.url),
 'export const hasResultVideo='+hasAsset('scorecard-vsl.mp4')+';\n'+
 'export const hasCaptions='+hasAsset('scorecard-vsl.en.vtt')+';\n');
