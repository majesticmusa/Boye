import {createHmac,timingSafeEqual} from 'node:crypto';
import {db} from '../../server/store.mjs';
import {reconcile} from '../../server/payments.mjs';
export default async function handler(req){
 if(req.method!=='POST' || !process.env.PAYSTACK_SECRET_KEY) return new Response(null,{status:404});
 const raw=await req.text(), signature=req.headers.get('x-paystack-signature')||'';
 const expected=createHmac('sha512',process.env.PAYSTACK_SECRET_KEY).update(raw).digest();
 if(!/^[a-f0-9]{128}$/.test(signature) || !timingSafeEqual(expected,Buffer.from(signature,'hex')))return new Response(null,{status:401});
 const event=JSON.parse(raw);
 if(event.event==='charge.success' && /^boye-[0-9a-f]{48}$/.test(event.data?.reference)) await reconcile(db(),event.data.reference);
 return new Response('OK');
}
export const config={path:'/hooks/paystack'};