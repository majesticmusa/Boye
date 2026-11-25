export const sprint = 35000;
export const system = 150000;
export const day = 86400000;
export const booking = 'https://www.boyedigital.com.ng/service-booking';
export const money = n => '₦' + n.toLocaleString('en-NG');
export const pillars = [
 ['Offer clarity','Can a stranger see why they should choose you?','Put the buyer, the outcome and one reason to choose you in the first sentence of your offer.'],
 ['Lead capture','Can a curious visitor stay in touch?','Give visitors one useful resource and a short form that leads naturally into your offer.'],
 ['Follow-up','Does every enquiry have a next step?','Write a first reply that answers the question and gives the buyer one clear next step.'],
 ['Ad readiness','Can you trace an enquiry back to its source?','Tag the link in your next campaign and test one conversion event before increasing spend.'],
 ['Conversion proof','Can buyers see evidence before they commit?','Place a relevant customer example beside the booking or purchase button.']
];
export const questions = [
 ['Can a new visitor understand your offer in five seconds?','My page lists general features or services.','It makes sense after I explain it in a call or DM.','The buyer, outcome and difference are clear upfront.'],
 ['Does your offer make the decision easier?','I have no clear guarantee or reason to act now.','I have basic terms or a general promise.','I give a clear guarantee or milestone and a genuine reason to act.'],
 ['What happens when a visitor is interested but isn’t ready to buy?','Most leave without sharing their details.','They can message me or visit a general link.','A focused page offers a resource and captures their details.'],
 ['How well does your free resource connect to your offer?','I don’t have one yet.','I have a freebie, but the connection is loose.','It solves the step my buyer takes just before buying.'],
 ['How consistently do new leads hear from you?','I follow up when I remember.','I send one or two messages, then usually stop.','A planned sequence builds trust and invites action.'],
 ['How quickly do warm enquiries get a useful reply?','Often after a day, or without a clear next step.','Usually within hours, but conversations can stall.','Quickly, with a specific way to book or buy.'],
 ['Can you tell which page or campaign brought in a lead?','I have no tracking, or I’m unsure it works.','Basic tracking is installed, but conversions are unclear.','I’ve verified events and tagged links against real enquiries.'],
 ['How do you decide which ads or content to keep running?','I promote one post and see what happens.','I test sometimes, but keep weak ads running.','I compare different hooks against clear cost and conversion targets.'],
 ['Where can a buyer see evidence that your offer works?','I have little visible proof yet.','I have feedback, but buyers have to look for it.','Relevant examples appear on the page and in follow-up.'],
 ['Can a warm prospect follow a clear path from click to purchase?','Traffic lands on a profile or in scattered chats.','Some steps connect, but there are gaps.','Each step leads naturally to the next, through to booking or checkout.']
];
export function assess(answers) {
 if (!Array.isArray(answers) || answers.length !== 10 || Array.from(answers).some(n => !Number.isInteger(n) || n<0 || n>2)) throw new Error('Answer all ten questions.');
 const scores = pillars.map((_,i)=> answers[2*i]+answers[2*i+1]);
 const total = scores.reduce((a,b)=>a+b,0);
 return {scores,total,band:total<10?'High-Leak':total<16?'Growth-Gap':'Scale-Ready',priority:scores.indexOf(Math.min(...scores)),primary:total<16?'sprint':'system'};
}
export function quote(plan,receipt,now=Date.now()) {
 const age = receipt ? now-Date.parse(receipt.paidAt) : Infinity;
 const credit = plan==='system' && age>=0 && age<=7*day ? sprint : 0;
 return {credit,amount:(plan==='sprint'?sprint:system)-credit};
}
export function contact(input) {
 const name=String(input.name||'').trim(), email=String(input.email||'').trim().toLowerCase();
 let phone=String(input.phone||'').replace(/[\s()-]/g,'');
 if (/^0\d{10}$/.test(phone)) phone='+234'+phone.slice(1);
 if (/^234\d{10}$/.test(phone)) phone='+'+phone;
 if (name.length<2 || name.length>90 || email.length>160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('Enter your name, a valid email and a WhatsApp number with country code.');
 return {name,email,phone};
}
