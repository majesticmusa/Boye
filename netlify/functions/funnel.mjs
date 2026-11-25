import {assess,contact,quote} from '../../public/model.mjs';
import {db,get,secret,hash,cookie,webCookie,json,origin,ensure,InputError,prefs} from '../../server/store.mjs';
import {checkout,reconcile} from '../../server/payments.mjs';
export default async function handler(req) {
 try {
 const s=db(),action=new URL(req.url).pathname.split('/').pop();
 let token=cookie(req), id=token?hash(token):null;
 if(req.method==='GET' && action==='session'){
  const lead=id && await get(s,'leads/'+id);
  const receipt=lead && await get(s,'paid/'+id+'/sprint');
  return json({result:lead?.result||null,systemPaid:!!(lead && await get(s,'paid/'+id+'/system')),sprintPaid:!!receipt,systemQuote:quote('system',receipt),paymentEnabled:!!process.env.PAYSTACK_SECRET_KEY,qualified:!!(lead && await get(s,'qualification/'+id))});
 }
 if(req.method!=='POST') return json({error:'Use POST.'},405);
 if(req.headers.get('origin')!==new URL(req.url).origin || !req.headers.get('content-type')?.startsWith('application/json')) return json({error:'Invalid request origin.'},403);
 const raw=await req.text(); ensure(raw.length<=12000,'Request is too large.');
 let input;try{input=JSON.parse(raw)}catch{throw new InputError('Invalid request.')}
 if(action==='stop'){
  const lookup=await prefs(s,input.token);ensure(lookup,'This preference link is invalid.');
  await s.setJSON('stopped/'+lookup.id,{at:Date.now()});return json({ok:true});
 }
 if(action==='assess'){
  ensure(!input.website,'Submission unavailable.');
  let details,result;try{details=contact(input);result=assess(input.answers)}catch(e){throw new InputError(e.message)}
  if(!token){token=secret();id=hash(token)}
  const existing=await get(s,'leads/'+id);
  if(existing && existing.email!==details.email){token=secret();id=hash(token)}
  const stop=secret(),created=Date.now();
  const source=Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(k=>[k,String(input.source?.[k]||'').slice(0,140)]));
  const lead={...details,answers:input.answers,result,source,created,stop,emailOpt:input.emailOpt===true,waOpt:input.waOpt===true};
  await s.setJSON('prefs/'+hash(stop),{id});
  await s.setJSON('leads/'+id,lead);
  if(lead.emailOpt||lead.waOpt)await s.setJSON('queue/'+id,{created},{onlyIfNew:true});
  return json({result},200,{'Set-Cookie':webCookie(token)});
 }
 ensure(id,'Start with your free scorecard.');
 const lead=await get(s,'leads/'+id);ensure(lead,'Start with your free scorecard.');
 if(action==='qualify'){
  ensure(['sprint','system'].includes(input.plan),'Choose an offer.');
  const business=String(input.business||'').trim(),goal=String(input.goal||'').trim();
  ensure(business.length>=2 && business.length<=120 && goal.length>=5 && goal.length<=700,'Add your business name and the outcome you want.');
  ensure(['Ready now','Within 30 days','Exploring'].includes(input.timing),'Select a timeline.');
  await s.setJSON('qualification/'+id,{business,goal,plan:input.plan,timing:input.timing,created:Date.now()});
  return json({ok:true});
 }
 if(action==='checkout'){
  const q=await get(s,'qualification/'+id);ensure(q && q.plan===input.plan,'Complete the quick fit check for this offer.');
  return json({url:await checkout(s,id,lead,input.plan,origin(req))});
 }
 if(action==='verify')return json(await reconcile(s,input.ref,id));
 return json({error:'Unknown action.'},404);
 }catch(e){
  if(e instanceof InputError)return json({error:e.message},400);
  console.error('Funnel request failed',e.name);
  return json({error:'We couldn’t finish that request. Your answers are still here. Please try again.'},503);
 }
}
export const config={path:'/api/funnel/*',rateLimit:{action:'rate_limit',aggregateBy:['ip','domain'],windowSize:60,windowLimit:45}};