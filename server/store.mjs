import {getStore} from '@netlify/blobs';
import {randomBytes,createHash} from 'node:crypto';
import {storeName,siteUrl} from './deployment.mjs';
export const db=()=>getStore({name:storeName,consistency:'strong'});
export const secret=()=>randomBytes(24).toString('hex');
export const hash=s=>createHash('sha256').update(s).digest('hex');
export const get=(s,key)=>s.get(key,{type:'json'});
export const cookie=(req)=>/\bboye_visit=([a-f0-9]{48})(?:;|$)/.exec(req.headers.get('cookie')||'')?.[1];
export const webCookie=t=>'boye_visit='+t+'; Path=/; Max-Age=7776000; HttpOnly; Secure; SameSite=Lax';
export const json=(x,status=200,headers={})=>Response.json(x,{status,headers:{'Cache-Control':'no-store',...headers}});
export const origin=(req)=>siteUrl||new URL(req.url).origin;
export class InputError extends Error {}
export const ensure=(condition,message)=>{if(!condition) throw new InputError(message)};
export async function prefs(s,token) {
 if(!/^[a-f0-9]{48}$/.test(token||'')) return null;
 return get(s,'prefs/'+hash(token));
}
