import test from 'node:test';
import assert from 'node:assert/strict';
import {assess,contact,day,quote} from '../public/model.mjs';
import {message} from '../server/messages.mjs';
import {matches,checkout,reconcile} from '../server/payments.mjs';
const now=Date.UTC(2026,10,25);
const lead={name:'Demo Owner',email:'test@example.invalid',result:assess(Array(10).fill(1)),stop:'a'.repeat(48)};
for(const [total,band] of [[0,'High-Leak'],[9,'High-Leak'],[10,'Growth-Gap'],[15,'Growth-Gap'],[16,'Scale-Ready'],[20,'Scale-Ready']]){
 test('readiness band at '+total,()=>{const r=assess(Array.from({length:10},(_,i)=>Math.max(0,Math.min(2,total-2*i))));assert.equal(r.total,total);assert.equal(r.band,band);assert.equal(r.primary,total>=16?'system':'sprint')});
}
test('malformed answers cannot produce a score',()=>{for(const a of [Array(10),[],Array(10).fill(3),Array(10).fill('1')])assert.throws(()=>assess(a))});
test('normalizes Nigerian contact details',()=>assert.equal(contact({name:'Test Owner',phone:'0801 234 5678',email:'User@Example.invalid'}).phone,'+2348012345678'));
test('seven-day credit includes exact deadline',()=>{const r={paidAt:new Date(now).toISOString()};assert.equal(quote('system',null,now).amount,150000);assert.equal(quote('system',r,now+7*day).amount,115000);assert.equal(quote('system',r,now+7*day+1).credit,0);assert.equal(quote('sprint',r,now).amount,35000)});
test('all seven nurture messages have content and a stop link',()=>{const messages=Array.from({length:7},(_,i)=>message(i,lead,null,'https://example.invalid'));assert.equal(new Set(messages.map(m=>m.subject)).size,7);for(const m of messages)assert.ok(m.text.includes('/preferences#'));assert.ok(message(1,lead,{paidAt:new Date().toISOString()},'https://example.invalid').action.endsWith('/system'))});
test('validate currency, amount, payer, status and reference',()=>{const order={ref:'abc',amount:35000,email:lead.email},good={reference:'abc',amount:3500000,currency:'NGN',status:'success',customer:{email:lead.email},paid_at:new Date(now).toISOString()};assert.equal(matches(order,good),true);for(const diff of [{currency:'USD'},{amount:1},{reference:'different'},{customer:{email:'other@example.invalid'}},{status:'pending'}])assert.equal(matches(order,{...good,...diff}),false)});
test('checkout, verification, retry and discounted upgrade use provider and stored records',async t=>{
 const memory=new Map();let rev=0;const s={get:async k=>memory.get(k)?.data||null,getWithMetadata:async k=>memory.get(k)||null,setJSON:async(k,data,c={})=>{const old=memory.get(k);if(c.onlyIfNew&&old || c.onlyIfMatch && old?.etag!==c.onlyIfMatch)return {modified:false};const etag=String(++rev);memory.set(k,{etag,data});return {modified:true,etag}}};
 const old=process.env.PAYSTACK_SECRET_KEY;process.env.PAYSTACK_SECRET_KEY='local-fixture';
 t.after(()=>{if(old===undefined)delete process.env.PAYSTACK_SECRET_KEY;else process.env.PAYSTACK_SECRET_KEY=old});
 let initialized;
 t.mock.method(globalThis,'fetch',async(url,opt)=>{if(url.endsWith('initialize')){initialized=JSON.parse(opt.body);return Response.json({status:true,data:{authorization_url:'https://checkout.paystack.com/fixture'}})}
 return Response.json({status:true,data:{status:'success',currency:'NGN',amount:initialized.amount,customer:{email:initialized.email},reference:initialized.reference,paid_at:new Date().toISOString()}})});
 await checkout(s,'id',lead,'sprint','https://example.invalid');assert.equal(initialized.amount,3500000);
 const ref=initialized.reference;await assert.rejects(()=>reconcile(s,ref,'another-owner'));
 await reconcile(s,ref,'id');await reconcile(s,ref,'id');
 await assert.rejects(()=>checkout(s,'id',lead,'sprint','https://example.invalid'));
 await checkout(s,'id',lead,'system','https://example.invalid');assert.equal(initialized.amount,11500000);
 await reconcile(s,initialized.reference,'id');
 await assert.rejects(()=>checkout(s,'id',lead,'system','https://example.invalid'));
});