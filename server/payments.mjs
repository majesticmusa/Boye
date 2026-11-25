import {get,secret,ensure} from './store.mjs';
import {quote} from '../public/model.mjs';
async function paystack(path,payload) {
 const response=await fetch('https://api.paystack.co/transaction/'+path,{method:payload?'POST':'GET',headers:{Authorization:'Bearer '+process.env.PAYSTACK_SECRET_KEY,'Content-Type':'application/json'},body:payload?JSON.stringify(payload):undefined,signal:AbortSignal.timeout(12000)});
 const result=await response.json();
 if (!response.ok || !result.status) throw new Error('Payment provider unavailable');
 return result.data;
}
export async function checkout(s,id,lead,plan,base) {
 ensure(process.env.PAYSTACK_SECRET_KEY,'Online checkout is unavailable. You can book a strategy call.');
 ensure(['sprint','system'].includes(plan),'Choose a valid offer.');
 ensure(!await get(s,'paid/'+id+'/system'),'Your full system payment is already recorded.');
 const receipt=await get(s,'paid/'+id+'/sprint');
 ensure(!(plan==='sprint' && receipt),'Your Sprint payment is already recorded.');
 const {amount,credit}=quote(plan,receipt);
 const slot='checkout/'+id+'/'+plan+'-'+amount;
 let entry=await get(s,slot);
 if(entry?.url && Date.now()-entry.created<30*60000) return entry.url;
 const stamped=await s.getWithMetadata(slot,{type:'json'});
 if(stamped?.data?.url && Date.now()-stamped.data.created<30*60000) return stamped.data.url;
 ensure(!stamped || Date.now()-stamped.data.created>60000,'Checkout is being prepared. Try again in a moment.');
 const order={id,plan,amount,credit,email:lead.email,created:Date.now(),ref:'boye-'+secret()};
 const locked=await s.setJSON(slot,order,stamped?{onlyIfMatch:stamped.etag}:{onlyIfNew:true});
 ensure(locked.modified,'Checkout is being prepared. Try again in a moment.');
 await s.setJSON('orders/'+order.ref,order,{onlyIfNew:true});
 const data=await paystack('initialize',{email:lead.email,amount:amount*100,currency:'NGN',reference:order.ref,callback_url:base+'/receipt'});
 ensure(new URL(data.authorization_url).hostname==='checkout.paystack.com','Checkout could not be opened.');
 await s.setJSON(slot,{...order,url:data.authorization_url},{onlyIfMatch:locked.etag});
 return data.authorization_url;
}
export function matches(order,data) {
 return data.status==='success' && data.reference===order.ref && data.currency==='NGN' && data.amount===order.amount*100 && data.customer?.email?.toLowerCase()===order.email && Number.isFinite(Date.parse(data.paid_at));
}
export async function reconcile(s,ref,owner) {
 ensure(/^boye-[a-f0-9]{48}$/.test(ref||''),'Unknown payment reference.');
 const order=await get(s,'orders/'+ref);
 ensure(order && (!owner || order.id===owner),'Payment record unavailable.');
 const verified=await paystack('verify/'+ref);
 ensure(matches(order,verified),'Payment has not been confirmed. Please check again before making another payment.');
 const receipt={plan:order.plan,amount:order.amount,paidAt:verified.paid_at,ref};
 await s.setJSON('receipts/'+ref,receipt,{onlyIfNew:true});
 await s.setJSON('paid/'+order.id+'/'+order.plan,receipt,{onlyIfNew:true});
 return receipt;
}