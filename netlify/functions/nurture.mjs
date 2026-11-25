import {db,get,hash} from '../../server/store.mjs';
import {siteUrl} from '../../server/deployment.mjs';
import {day} from '../../public/model.mjs';
import {message} from '../../server/messages.mjs';
async function deliver(channel,key,lead,m,i) {
 let response;
 if(channel==='email'){
  response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':hash(key)},body:JSON.stringify({from:process.env.EMAIL_FROM||'Boye Digital <support@boyedigital.com.ng>',to:[lead.email],subject:m.subject,text:m.text}),signal:AbortSignal.timeout(5000)});
 }else{
  response=await fetch('https://graph.facebook.com/'+process.env.WA_GRAPH_VERSION+'/'+process.env.WA_PHONE_ID+'/messages',{method:'POST',headers:{Authorization:'Bearer '+process.env.WA_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:lead.phone.slice(1),type:'template',template:{name:'boye_funnel_day_'+(i+1),language:{code:process.env.WA_LANGUAGE||'en'},components:[{type:'body',parameters:[m.first,m.action,m.stop].map(text=>({type:'text',text}))}]}}),signal:AbortSignal.timeout(5000)});
 }
 if(!response.ok)throw Object.assign(new Error('Provider rejected message'),{retryable:response.status===429 || channel==='email',status:response.status});
}
async function processLead(s,id){
 const lead=await get(s,'leads/'+id);
 if(!lead || await get(s,'stopped/'+id) || await get(s,'paid/'+id+'/system')){await s.delete('queue/'+id);return}
 const i=Math.floor((Date.now()-lead.created)/day);
 if(i>=7){await s.delete('queue/'+id);return}
 if(i<0)return;
 const receipt=await get(s,'paid/'+id+'/sprint');
 const m=message(i,lead,receipt,siteUrl);
 for(const channel of ['email','wa']){
  if(channel==='email' && !(lead.emailOpt&&process.env.RESEND_API_KEY))continue;
  if(channel==='wa' && !(lead.waOpt&&process.env.WA_TOKEN&&process.env.WA_PHONE_ID&&process.env.WA_GRAPH_VERSION))continue;
  const key='delivery/'+hash(channel==='email'?lead.email:lead.phone)+'/'+channel+'/'+new Date(lead.created+i*day).toISOString().slice(0,10);
  const previous=await s.getWithMetadata(key,{type:'json'});
  if(previous && !(previous.data.retryAt && previous.data.retryAt<=Date.now()))continue;
  const claim={state:'dispatching',at:Date.now(),retryAt:channel==='email'?Date.now()+3600000:null};
  const write=await s.setJSON(key,claim,previous?{onlyIfMatch:previous.etag}:{onlyIfNew:true});
  if(!write.modified)continue;
  try{
   if(await get(s,'stopped/'+id) || await get(s,'paid/'+id+'/system'))continue;
   await deliver(channel,key,lead,m,i);await s.setJSON(key,{state:'accepted',at:Date.now()},{onlyIfMatch:write.etag});
  }catch(e){
   const retry=e.retryable||channel==='email';
   await s.setJSON(key,{state:retry?'retry':'review',status:e.status||0,retryAt:retry?Date.now()+3600000:null},{onlyIfMatch:write.etag});
   console.error('Nurture delivery needs attention',channel,e.status||'network');
  }
 }
}
export default async function handler(){
 if(!siteUrl || !(process.env.RESEND_API_KEY || process.env.WA_TOKEN))return;
 const s=db(), checkpoint=await get(s,'scheduler/cursor');
 const start=Date.now();
 const {blobs}=await s.list({prefix:'queue/'});
 for(const entry of blobs.sort((a,b)=>a.key<b.key?-1:1)){
  if(checkpoint && entry.key<=checkpoint.after)continue;
  await processLead(s,entry.key.slice(6));
  if(Date.now()-start>14000){await s.setJSON('scheduler/cursor',{after:entry.key});return}
 }
 if(checkpoint)await s.delete('scheduler/cursor');
}
export const config={schedule:'*/10 * * * *'};