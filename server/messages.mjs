import {pillars,money,system,sprint} from '../public/model.mjs';
export const notes=[
 ['Your marketing scorecard','Pick one place to improve this week.'],
 ['Give your offer the five-second test','Read the first sentence on your page to someone outside your business. Can they tell who it helps and what changes for that buyer? Rewrite it in their own words.'],
 ['Give the curious visitor a next step','Imagine a clinic posting about teeth cleaning. A short first-visit checklist gives a curious reader a reason to leave their details. What small question could your business answer before a buyer books?'],
 ['Write tomorrow’s first reply today','Open the last five enquiries you received. Write a reply to the most common question and finish with one next step. Give that reply to the person who answers your messages.'],
 ['Put your proof beside the decision','Choose one real customer story you have permission to share. Describe the starting problem, what you did and the outcome. Put it beside your booking link.'],
 ['Follow one click through your funnel','Open your latest campaign link on a phone. Follow it as a first-time buyer. Check whether the form works, the next step makes sense and you can identify where the enquiry came from.'],
 ['Decide what to build next','Boye Digital can build your five-page funnel in 3–4 weeks, then optimize for 30 days. The launch rate is '+money(system)+' and ad spend is separate.']
];
export function message(index,lead,receipt,base){
 const [subject,lesson]=notes[index];
 const first=lead.name.split(/\s+/)[0];
 const priority=pillars[lead.result.priority];
 const opening=index===0?'You scored '+lead.result.total+'/20 ('+lead.result.band+'). Start with '+priority[0].toLowerCase()+'. '+priority[2]:lesson;
 const route=receipt || index>=4 || lead.result.primary==='system'?'system':'sprint';
 const action=base+'/'+route;
 const stop=base+'/preferences#'+lead.stop;
 const offer=receipt?'Your '+money(sprint)+' Sprint payment counts towards the full system when you upgrade within seven days of payment.':route==='sprint'?'The '+money(sprint)+' Foundation Sprint turns these decisions into a usable plan in 5–7 business days.':'See what the 60-day build includes and book a fit call.';
 return {subject,text:'Hi '+first+',\n\n'+opening+'\n\n'+offer+'\n'+action+'\n\nMusa, Boye Digital\nPort Harcourt, Nigeria\nStop these messages: '+stop,first,action,stop};
}