import {contact,questions,pillars,booking,money,sprint,system} from './model.mjs';
const main=document.querySelector('main');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(title,url,style='')=>'<a class="button '+style+'" href="'+esc(url)+'">'+title+' <span class="arr" aria-hidden="true">↗</span></a>';
const lesson=(name)=>'<div class="kicker">'+name+'</div>';
const btn=(label)=>'<button class="primary" type="submit">'+label+' <span aria-hidden="true">→</span></button>';
const status='<p class="status" role="alert" id="status"></p>';
const narrow=content=>'<div class="narrow">'+content+'</div>';
const title=(k,t,sub='')=>lesson(k)+'<h1>'+t+'</h1>'+(sub?'<p class="lead">'+sub+'</p>':'');
const field=(label,name,attrs)=>'<label class="field">'+label+'<input name="'+name+'" '+attrs+' required></label>';
const ticks=n=>'<span class="ticks" aria-label="'+n+' out of 4">'+[0,1,2,3].map(i=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</span>';
const lines=scores=>pillars.map(([p],i)=>'<div class="repline"><span>'+p+'</span>'+ticks(scores[i])+'</div>').join('');
const getSaved=(key,fallback)=>{try{return JSON.parse(sessionStorage.getItem('boye_'+key))??fallback}catch{return fallback}};
const save=(key,value)=>{try{sessionStorage.setItem('boye_'+key,JSON.stringify(value))}catch{}};
const query=new URLSearchParams(location.search);
const source=Object.fromEntries([...query].filter(([k])=>['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].includes(k)));
if(Object.keys(source).length)save('source',source);
const plan=query.get('plan')==='system'?'system':'sprint';
const next=query.get('next')==='system'?'system':query.get('next')==='sprint'?'sprint':'';
const planName=p=>p==='system'?'60-Day Done-For-You System':'Conversion Foundation Sprint';
const currentPath=location.pathname.replace(/\/$/,'')||'/';
const to=url=>location.assign(url);
function home(){
 main.innerHTML='<section class="hero"><div class="herogrid"><div>'+lesson('Free marketing diagnostic')+'<h1>Where are your leads <em>slipping away?</em></h1><p>You’re getting clicks, DMs and enquiries. Find the gap between that first sign of interest and a paying customer.</p>'+link('Find my marketing leak','/assessment')+'<div class="meta">10 questions &nbsp;·&nbsp; 5 areas of your funnel &nbsp;·&nbsp; Instant results</div></div><div class="reportwrap"><div class="report"><div class="rephead"><b>Boye Digital</b><span>Sample report</span></div><h2>Marketing Leak<br>&amp; Readiness Scorecard</h2><div class="gauge" aria-hidden="true"></div>'+lines([3,1,2,3,3])+'<div class="repfooter"><b>12 / 20</b><span>Growth-Gap stage</span></div></div></div></div></section><section class="wrap section" id="pillars">'+lesson('Inside the scorecard')+'<h2>Five places a lead can slip away.</h2><p class="intro">Your result shows how each part of your marketing holds up and gives you one practical change to make first.</p><div class="pillars">'+pillars.map(([a,b],i)=>'<div class="pillar"><span class="number">0'+(i+1)+'</span><h3>'+a+'</h3><p>'+b+'</p></div>').join('')+'</div></section>';
 if(location.hash==='#pillars')document.querySelector('#pillars').scrollIntoView();
}
async function api(action,data){
 const opt=data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)};
 const res=await fetch('/api/funnel/'+action,{...opt,cache:'no-store'});
 let body;try{body=await res.json()}catch{throw new Error('The scorecard service is unavailable. Please try again shortly.')}
 if(!res.ok)throw new Error(body.error||'Please try again shortly.');
 return body;
}
function submit(work){
 const form=document.querySelector('#flow');
 form.addEventListener('submit',async event=>{
  event.preventDefault();const button=form.querySelector('[type="submit"]');if(button.disabled)return;
  button.disabled=true;const error=document.querySelector('#status');if(error)error.textContent='';
  try{await work(Object.fromEntries(new FormData(form)),event)}catch(e){if(error)error.textContent=e.message}finally{button.disabled=false}
 });
}
let answers=getSaved('answers',[]);if(!Array.isArray(answers))answers=[];
let step=Math.max(0,Math.min(10,Number(getSaved('step',0))||0,answers.length));
function quiz(){
 save('step',step);
 if(step===10){capture();return}
 const q=questions[step];
 main.innerHTML=narrow('<div class="split"><span class="tag">Marketing leak scorecard</span><span class="tiny">'+(step+1)+' / 10</span></div><div class="progress"><i style="width:'+((step+1)*10)+'%"></i></div>'+lesson(pillars[Math.floor(step/2)][0])+'<form id="flow"><fieldset><legend><h1>'+q[0]+'</h1></legend><div class="choices">'+q.slice(1).map((v,i)=>'<label class="choice"><input type="radio" name="answer" value="'+i+'" '+(answers[step]===i?'checked':'')+' required><span>'+v+'</span></label>').join('')+'</div></fieldset><div class="actions">'+btn(step===9?'Finish questions':'Continue')+(step?'<button type="button" id="back" class="back">Previous question</button>':'')+'</div>'+status+'</form>');
 document.querySelector('#back')?.addEventListener('click',()=>{step--;quiz()});
 submit(data=>{answers[step]=Number(data.answer);save('answers',answers);step++;quiz();main.focus()});
}
function capture(){
 main.innerHTML=narrow(title('Your scorecard is ready','See where to focus first.','Get your five scores, your biggest gap and a practical next step.')+'<form id="flow" class="sheet">'+field('Your name','name','autocomplete="name" minlength="2" maxlength="90"')+field('Email address','email','type="email" autocomplete="email" maxlength="160"')+field('WhatsApp number','phone','type="tel" autocomplete="tel" placeholder="+234 801 234 5678" maxlength="24"')+'<label class="trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><p class="tiny">We save these details with your result. Choose any follow-up you would like.</p><label class="check"><input type="checkbox" name="emailOpt"> Send me the seven-day email series with marketing tips and Boye Digital offers.</label><label class="check"><input type="checkbox" name="waOpt"> Send me the seven-day series on WhatsApp.</label><p class="tiny"><a href="/privacy" target="_blank" rel="noopener">How we use your details</a></p><div class="actions">'+btn('Show my scorecard')+'<button id="back" type="button" class="back">Review my answers</button></div>'+status+'</form>');
 document.querySelector('#back').onclick=()=>{step=9;quiz()};
 submit(async data=>{contact(data);await api('assess',{...data,answers,emailOpt:!!data.emailOpt,waOpt:!!data.waOpt,source:getSaved('source',{})});save('step',0);save('answers',[]);to(next?'/qualify?plan='+next:'/results')});
}
function startFirst(p=''){
 main.innerHTML=narrow(title('Free marketing diagnostic','Start with your scorecard.','Your ten answers will help us recommend the right next step for your business.')+link('Take the scorecard','/assessment'+(p?'?next='+p:''),'dark'));
}
function results(s){
 const r=s.result;if(!r){startFirst();return}
 const full=r.total===20,p=pillars[r.priority],primary=r.primary,other=primary==='sprint'?'system':'sprint';
 const messages={'High-Leak':'Start with the basics before putting more money behind your traffic.','Growth-Gap':'Parts of your funnel are working. Closing the gaps can help more interested buyers take the next step.','Scale-Ready':'Your foundations are in place. Your next move is to test the full journey and optimize with real campaign data.'};
 main.innerHTML=narrow(title('Your scorecard',r.band+' stage',messages[r.band])+'<div class="resultgrid"><div class="sheet"><span class="tag">Readiness score</span><div class="score">'+r.total+'<small> / 20</small></div>'+lines(r.scores)+'</div><div class="sheet"><span class="tag">'+(full?'Next experiment':'First priority')+'</span><h2>'+(full?'Test the full journey':p[0])+'</h2><p>'+(full?'Follow a tagged campaign link all the way to a completed booking. Compare what the buyer sees with the events you record.':p[2])+'</p></div></div><details class="sheet"><summary><strong>See how one change works in practice</strong></summary><h3>A clinic enquiry, from click to booking</h3><p>Imagine someone clicking a clinic’s teeth-cleaning post. They land on a general profile, have a look and leave. Give that same reader a first-visit checklist and a way to request it. The clinic can now answer their question and offer a booking link in the next message.</p><p class="tiny">Illustrative walkthrough from Boye Digital.</p></details><div class="sheet"><span class="tag">Recommended next step</span><h2>'+planName(primary)+'</h2><p>'+(primary==='sprint'?'Build your buyer profile, offer, lead magnet and funnel wireframe in 5–7 business days.':'Get a connected funnel built in 3–4 weeks, followed by 30 days of active optimization.')+'</p><div class="actions">'+link('Explore the '+money(primary==='sprint'?sprint:system)+' offer','/'+primary,'dark')+'</div><a class="plainlink" href="/'+other+'">Also see the '+planName(other)+' →</a></div>');
}
const sprintItems=['Buyer persona and buying-trigger dossier, including the five objections your offer needs to answer.','Offer architecture covering the outcome, timing, risk reversal, genuine urgency and price.','Lead magnet blueprint and draft, with a clear invitation into your paid offer.','Funnel wireframe, page headlines and three distinct hooks for content or ads.','A 15-minute walkthrough and a roadmap for the full build.'];
const fullItems=['Buyer persona and offer development','Five live pages from opt-in and trust-building through to booking or checkout and thank-you','Meta Pixel, Google Analytics, tagged links and verified conversion events','Seven-day WhatsApp and email follow-up','30-day content calendar with captions','Video and static ad creatives with copy variations','Meta campaign launch and 30 days of active optimization','Weekly performance reports and private WhatsApp access'];
function offer(kind){
 const isSprint=kind==='sprint',cta=link(isSprint?'Start my Sprint':'Check fit for the system','/qualify?plan='+kind,'dark');
 main.innerHTML=narrow(title(isSprint?'5–7 business days':'60-day launch & optimization',planName(kind),isSprint?'Know exactly who you’re selling to, what to promise and what should happen after the first click.':'Get your offer, five-page funnel, tracking and follow-up working together. Then improve them with a full month of real campaign data.')+'<div class="prices">'+money(isSprint?sprint:system)+'<small>'+(isSprint?'One-time Sprint fee':'Launch rate · Standard engagement ₦250,000')+'</small></div>'+cta+'<h2>What you get</h2><div class="sheet"><ul>'+(isSprint?sprintItems:fullItems).map(x=>'<li>'+x+'</li>').join('')+'</ul></div><div class="photoNote"><strong>Your Sprint credit</strong><p>Upgrade within seven days of your Sprint payment and all ₦35,000 goes towards the ₦150,000 system. Your remaining balance is ₦115,000.</p></div>'+(isSprint?'':'<h2>The 60-day commitment</h2><p>We build and launch in 3–4 weeks, then actively optimize for 30 days. If agreed launch or optimization milestones are outstanding, we keep optimizing at no extra charge, provided the system launches, you fund the agreed minimum ad spend and follow up promptly with leads.</p><h3>Budget and approvals</h3><p>You pay ad spend directly to the platform. Inputs and approvals within 48 hours keep the build on schedule. We quote extra scope separately.</p><h3>Day 60</h3><p>You own your assets, tracking and leads. Ongoing monthly management is optional.</p>')+'<div class="actions">'+cta+'<a href="/'+(isSprint?'system':'sprint')+'">Compare the '+(isSprint?'full system':'Foundation Sprint')+'</a></div>');
}
function qualify(s){
 if(!s.result){startFirst(plan);return}
 if(s.systemPaid || plan==='sprint'&&s.sprintPaid){main.innerHTML=narrow(title('Payment on file','You’re already booked in for this offer.','Choose a call time to discuss your next steps.')+link('Book a call',booking,'dark')+(!s.systemPaid?' '+link('Explore the upgrade','/system','ghost'):''));return}
 const amount=plan==='sprint'?sprint:s.systemQuote.amount;
 main.innerHTML=narrow(title('Quick fit check',planName(plan),'Tell us a little about your business so we can prepare for your call or kickoff.')+'<div class="photoNote"><strong>'+money(amount)+'</strong> '+(plan==='system'&&s.systemQuote.credit?'after your verified ₦35,000 Sprint credit':'one-time fee')+'</div><form id="flow" class="sheet">'+field('Business name','business','minlength="2" maxlength="120" autocomplete="organization"')+'<label class="field">What would you like your marketing to achieve?<textarea name="goal" rows="3" minlength="5" maxlength="700" required></textarea></label><label class="field">When would you like to start?<select name="timing" required><option value="">Choose a timeline</option><option>Ready now</option><option>Within 30 days</option><option>Exploring</option></select></label>'+btn('Save and see next steps')+status+'</form>');
 submit(async data=>{await api('qualify',{...data,plan});to('/thank-you?plan='+plan)});
}
function thanks(s){
 if(!s.qualified){startFirst(plan);return}
 const paid=s.systemPaid || (plan==='sprint' && s.sprintPaid);
 main.innerHTML=narrow(title('Fit check received','Let’s talk through your plan.','Your answers are saved. Choose a time on Boye Digital’s calendar to discuss scope, timing and kickoff.')+link('Choose a strategy call time',booking,'dark')+(s.paymentEnabled && !paid?'<form id="flow" class="sheet"><h2>Ready to get started?</h2><p>Continue to Paystack to pay for your '+planName(plan)+'.</p><div class="actions">'+btn('Pay '+money(plan==='sprint'?sprint:s.systemQuote.amount))+'</div>'+status+'</form>':'')+'<p class="tiny" style="margin-top:20px">Your appointment is confirmed when you finish booking on the calendar.</p>');
 if(document.querySelector('#flow'))submit(async()=>to((await api('checkout',{plan})).url));
}
async function render(){
 if(currentPath==='/'){home();return}
 if(currentPath==='/assessment'){quiz();return}
 if(['/sprint','/system'].includes(currentPath)){offer(currentPath.slice(1));return}
 if(currentPath==='/privacy'){main.innerHTML=narrow(title('Boye Digital','Your details and preferences.')+'<p>We store your contact details, scorecard answers, campaign source and fit-check answers so we can show your recommendations and support a booking or purchase. A browser cookie reconnects you to your score and verified payment on this device.</p><h2>Follow-up is your choice</h2><p>Tick the email or WhatsApp box to receive the seven-day series. Each message includes a link to stop future messages. We use Resend for email, Meta for WhatsApp and Paystack for online checkout when connected. Card details are entered on Paystack.</p><h2>Get in touch</h2><p>For access, corrections, payment credit on another device, or deletion, contact <a href="mailto:support@boyedigital.com.ng">support@boyedigital.com.ng</a>.</p>');return}
 if(currentPath==='/preferences'){main.innerHTML=narrow(title('Message preferences','Stop the seven-day series.','This turns off future email and WhatsApp nurture messages for this scorecard.')+'<form id="flow">'+btn('Stop future messages')+status+'</form>');submit(async()=>{await api('stop',{token:location.hash.slice(1)});main.innerHTML=narrow(title('Preferences saved','You’re unsubscribed.'))});return}
 main.innerHTML=narrow('<p role="status">Loading your details…</p>');
 if(currentPath==='/receipt'){
  const receipt=await api('verify',{ref:query.get('reference')||query.get('trxref')});
  main.innerHTML=narrow(title('Payment verified','Thank you for your payment.',money(receipt.amount)+' received for the '+planName(receipt.plan)+'.')+link('Book your kickoff',booking,'dark')+(receipt.plan==='sprint'?'<div class="photoNote"><h3>Your ₦35,000 credit is ready</h3><p>Upgrade within seven days of payment and pay the remaining ₦115,000.</p></div>'+link('Apply my Sprint credit','/qualify?plan=system','ghost'):''));return
 }
 if(!['/results','/thank-you','/qualify'].includes(currentPath)){main.innerHTML=narrow(title('Page unavailable','Find your next step.')+link('Back to the scorecard','/'));return}
 const s=await api('session');
 if(currentPath==='/results')results(s);else if(currentPath==='/qualify')qualify(s);else thanks(s);
}
render().catch(e=>{main.innerHTML=narrow(title('Please try again','We couldn’t load this step.',esc(e.message))+'<div class="actions">'+link('Try again',location.pathname+location.search,'dark')+link('Book a call',booking,'ghost')+'</div>')});
