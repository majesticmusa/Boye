'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowUp,BookOpen,Calculator,ChevronRight,FlaskConical,GraduationCap,Lightbulb,Menu,MessageSquare,Plus,ShieldCheck,Sparkles,X} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {levels,topics,type Message} from '@/lib/tutor';
import {demoLessons,type DemoSubject} from '@/lib/demo';
import {createClient} from '@/lib/supabase/client';
import {BiologyLab} from './biology-lab';
type Session={sample?:boolean;id:string;title:string;level:typeof levels[number];topic:typeof topics[number];messages:Message[]};
const fresh=(level:Session['level']='SS1',topic:Session['topic']='Algebra'):Session=>({id:crypto.randomUUID(),title:'New conversation',level,topic,messages:[]});
const mathsPractice = [
  {
    "topic": "Percentages and profit",
    "questions": [
    {
        "question": "A schoolbag costs ₦8,000. What is its price after a 15% discount?",
        "answer": "10% of ₦8,000 is ₦800 and 5% is ₦400. Subtract the ₦1,200 discount from ₦8,000 to get ₦6,800."
    },
    {
        "question": "A trader buys a calculator for ₦4,000 and sells it for ₦4,800. What is the percentage profit?",
        "answer": "Profit is ₦4,800 − ₦4,000 = ₦800. Divide by the cost price and multiply by 100: 800 ÷ 4,000 × 100 = 20%."
    }
]
  },
  {
    "topic": "Sets",
    "questions": [
    {
        "question": "List the elements in the intersection of {2, 4, 6, 8} and {3, 6, 9}.",
        "answer": "An intersection contains the elements that appear in both sets. Only 6 appears in both, so the intersection is {6}."
    },
    {
        "question": "In a class of 30, 18 play football, 14 play volleyball and 6 play both. How many play neither?",
        "answer": "Add the two team sizes and subtract the overlap: 18 + 14 − 6 = 26. That leaves 30 − 26 = 4 students who play neither."
    }
]
  },
  {
    "topic": "Indices",
    "questions": [
    {
        "question": "Simplify 3⁴ × 3² and explain the rule you used.",
        "answer": "Both powers have base 3. Multiplication combines four factors of 3 with two more, so 3⁴ × 3² = 3⁶ = 729."
    },
    {
        "question": "If 2ˣ = 32, how can I find x?",
        "answer": "Double 1 five times: 2, 4, 8, 16, 32. That gives 2⁵ = 32, so x = 5."
    }
]
  },
  {
    "topic": "Number bases",
    "questions": [
    {
        "question": "Convert 1011 from base two to base ten using place value.",
        "answer": "The place values from right to left are 1, 2, 4 and 8. Add the places with a 1: 8 + 2 + 1 = 11."
    },
    {
        "question": "How do I write 19 in base two?",
        "answer": "19 = 16 + 2 + 1. For the places 16, 8, 4, 2, 1, write 1, 0, 0, 1, 1. The result is 10011 in base two."
    }
]
  },
  {
    "topic": "Geometry",
    "questions": [
    {
        "question": "Two angles in a triangle are 48° and 67°. Find the third angle.",
        "answer": "The angles add up to 180°. Subtract the two known angles: 180° − 48° − 67° = 65°."
    },
    {
        "question": "A ladder 5 m long rests against a wall. Its foot is 3 m from the wall. How high does it reach if the ground is level and the wall is vertical?",
        "answer": "The ladder is the hypotenuse. By Pythagoras, height² = 5² − 3² = 16. The height is 4 m."
    }
]
  },
  {
    "topic": "Statistics",
    "questions": [
    {
        "question": "Find the mean and median of 4, 6, 6, 8 and 11.",
        "answer": "The scores total 35, so the mean is 35 ÷ 5 = 7. In the ordered list the middle score is 6, so the median is 6."
    },
    {
        "question": "If 20 is added to the scores 3, 4, 5, 6 and 7, how do the mean and median change?",
        "answer": "Originally the mean and median are both 5. Adding 20 as a sixth score gives a mean of 45 ÷ 6 = 7.5 and a median of (5 + 6) ÷ 2 = 5.5."
    }
]
  }
];
const demoTopics = {
  Mathematics: { first: 'Algebra', practice: mathsPractice },
  English: { first: 'Reading comprehension', practice: [
  {
    "topic": "Grammar and agreement",
    "questions": [
    {
        "question": "Which verb fits ‘The basket of oranges is/are heavy’, and why?",
        "answer": "Say ‘The basket of oranges is heavy.’ The subject is ‘basket’, which is singular. Try leaving out ‘of oranges’ to hear the agreement."
    },
    {
        "question": "Rewrite ‘She don’t enjoy reading’ and explain the correction.",
        "answer": "Write ‘She doesn’t enjoy reading.’ With ‘she’, use ‘does’ for the auxiliary verb and keep ‘enjoy’ in its base form."
    }
]
  },
  {
    "topic": "Vocabulary in context",
    "questions": [
    {
        "question": "What does ‘reluctant’ mean in ‘Ada was reluctant to speak, but finally raised her hand’?",
        "answer": "Reluctant means hesitant or unwilling. The word ‘finally’ suggests Ada needed time to bring herself to speak."
    },
    {
        "question": "How does the meaning of ‘bank’ change between a river bank and a savings bank?",
        "answer": "A river bank is land along the edge of a river. A savings bank is a financial institution. Look at the surrounding words to choose the meaning."
    }
]
  },
  {
    "topic": "Punctuation",
    "questions": [
    {
        "question": "Where should the apostrophe go in ‘the girls uniforms’ if several girls own them?",
        "answer": "Write ‘the girls’ uniforms’. First form the plural ‘girls’, then put the apostrophe after the s to show shared or plural ownership."
    },
    {
        "question": "How would you punctuate this direct speech: Bisi said I will come tomorrow?",
        "answer": "Write: Bisi said, “I will come tomorrow.” The comma introduces Bisi’s words, and quotation marks show exactly what she said."
    }
]
  },
  {
    "topic": "Essay writing",
    "questions": [
    {
        "question": "How can I start a descriptive essay about a rainy morning in Port Harcourt?",
        "answer": "Try ‘Rain drummed on the zinc roof as I stepped into the flooded street.’ Pick one sound or sight and add a detail that puts the reader there."
    },
    {
        "question": "How would I organise a paragraph arguing for a school library?",
        "answer": "Start with a claim: ‘Our school needs a library.’ Give one reason, illustrate it with an example, then explain how it would help students."
    }
]
  },
  {
    "topic": "Figures of speech",
    "questions": [
    {
        "question": "Why is ‘the classroom was a beehive’ a metaphor?",
        "answer": "It calls the classroom a beehive directly. The comparison invites us to picture students busy and buzzing with activity."
    },
    {
        "question": "How could I turn ‘the wind was loud’ into personification?",
        "answer": "Try ‘The wind shouted through the shutters.’ Shouting gives the wind a human action. Which verb would make it sound gentler?"
    }
]
  },
  {
    "topic": "Letter writing",
    "questions": [
    {
        "question": "How should I open a formal letter to my principal requesting a reading club?",
        "answer": "After the address, date, salutation and subject line, state your request clearly: ‘I am writing to request permission to start a reading club at our school.’"
    },
    {
        "question": "How would my closing change if I wrote the same news to a friend?",
        "answer": "With a friend, you can close warmly with ‘Your friend,’ followed by your first name. A formal letter beginning ‘Dear Sir’ or ‘Dear Madam’ usually closes with ‘Yours faithfully’."
    }
]
  }
] },
  Biology: { first: 'Photosynthesis', practice: [
  {
    "topic": "Cell structure",
    "questions": [
    {
        "question": "Which structures would help me identify a typical leaf cell under a microscope?",
        "answer": "Look for a cell wall and, in many leaf cells, green chloroplasts. A large central vacuole often pushes the cytoplasm towards the edge."
    },
    {
        "question": "How do the cell wall and cell membrane differ in function?",
        "answer": "The wall gives the cell shape and support. The membrane just inside it controls which substances enter and leave."
    }
]
  },
  {
    "topic": "Nutrition",
    "questions": [
    {
        "question": "Why does the body need both carbohydrates and proteins?",
        "answer": "Carbohydrates supply energy. Proteins supply amino acids used to build and repair tissues and make molecules such as enzymes."
    },
    {
        "question": "How does chewing help the digestion of food?",
        "answer": "Chewing breaks food into smaller pieces, increasing the surface area for enzymes. It also mixes food with saliva, which starts starch digestion."
    }
]
  },
  {
    "topic": "Ecology",
    "questions": [
    {
        "question": "Can you build a food chain using grass, a grasshopper, a frog and a snake?",
        "answer": "Grass → grasshopper → frog → snake. Each arrow points from the food organism to the animal that gets energy by eating it."
    },
    {
        "question": "What might happen to that food chain if the number of frogs falls?",
        "answer": "With fewer frogs eating them, grasshoppers may increase and consume more grass. Snakes may have less food. Other food sources can affect the outcome."
    }
]
  },
  {
    "topic": "Respiration",
    "questions": [
    {
        "question": "How does breathing differ from cellular respiration?",
        "answer": "Breathing moves air into and out of the lungs. Cellular respiration releases energy from nutrients inside cells."
    },
    {
        "question": "Why do breathing and heart rate increase during exercise?",
        "answer": "Working muscles need more energy. Faster breathing and blood flow help deliver oxygen and carry away the extra carbon dioxide produced."
    }
]
  },
  {
    "topic": "Transport in plants",
    "questions": [
    {
        "question": "How does water travel from the roots to the leaves?",
        "answer": "Water enters root hairs by osmosis and moves into the xylem. As water evaporates from leaves, transpiration helps pull a continuous column of water upwards."
    },
    {
        "question": "How do xylem and phloem differ in what they carry?",
        "answer": "Xylem carries water and mineral ions, mainly up from roots. Phloem transports sugars from sources such as leaves to growing or storage tissues."
    }
]
  },
  {
    "topic": "Classification",
    "questions": [
    {
        "question": "What features help distinguish insects from spiders?",
        "answer": "Count the legs and body regions. Adult insects have six legs and three main body regions. Spiders have eight legs and two main body regions."
    },
    {
        "question": "Why do biologists use scientific names for organisms?",
        "answer": "Common names vary across languages and places. A scientific name identifies a species consistently, so people can tell exactly which organism is being discussed."
    }
]
  }
] },
};
const suggestions=['Help me understand fractions','Explain how to solve 2x + 5 = 17','Give me 3 practice questions'];
export default function TutorWorkspace({hosted=false,guestSubject}:{hosted?:boolean;guestSubject?:DemoSubject}){
 const lesson=guestSubject?demoLessons[guestSubject]:undefined;
 const subject=guestSubject??'Mathematics';
 const subjectTopics = demoTopics[subject];
 const [focusTopic, setFocusTopic] = useState(subjectTopics.first);
 const practice = subjectTopics.practice.find(item => item.topic === focusTopic);
 const prompts = practice?.questions.map(item => item.question) ?? (lesson ? [lesson.question] : suggestions);
 function preparedAnswer(text:string) {
   if (!lesson) return;
   if (text === lesson.question) return lesson.answer;
   return subjectTopics.practice.flatMap(topic => topic.questions).find(item => item.question === text)?.answer;
 }
 const SubjectIcon=guestSubject==='English'?BookOpen:guestSubject==='Biology'?FlaskConical:Calculator;
 const maxLength=guestSubject?400:4000;
 const [sessions,setSessions]=useState<Session[]>([]),[active,setActive]=useState<Session|null>(null),[question,setQuestion]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[menu,setMenu]=useState(false),[notice,setNotice]=useState('');
 const [authReady,setAuthReady]=useState(!hosted),[userEmail,setUserEmail]=useState(''),[email,setEmail]=useState(''),[authMessage,setAuthMessage]=useState('');
 const end=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null),lock=useRef(false);
 useEffect(()=>{
  if(!hosted)return;
  let cancelled=false;
  let unsubscribe:(()=>void)|undefined;
  async function checkAuth(){
   try{
    const supabase=createClient();
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
     if(!cancelled){setUserEmail(session?.user.email??'');setAuthReady(true)}
    });
    unsubscribe=()=>subscription.unsubscribe();
    const {data}=await supabase.auth.getUser();
    if(!cancelled){setUserEmail(data.user?.email??'');setAuthReady(true)}
   }catch{
    if(!cancelled){setAuthMessage('Sign-in is not configured yet. Please try again later.');setAuthReady(true)}
   }
  }
  void checkAuth();
  return()=>{cancelled=true;unsubscribe?.()};
 },[hosted]);
 async function signIn(event:FormEvent<HTMLFormElement>){event.preventDefault();setAuthMessage('');try{const supabase=createClient();const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:`${window.location.origin}/auth/callback`}});if(error)throw error;setAuthMessage('Check your email for a secure sign-in link.')}catch{setAuthMessage('We could not send a sign-in link. Check the email address and try again.')}}
 async function signOut(){const supabase=createClient();await supabase.auth.signOut();setUserEmail('');setAuthMessage('')}
 useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth',block:'end'})},[active?.messages.length,busy,error,userEmail]);
 if(hosted&&!authReady)return <main style={{maxWidth:560,margin:'12vh auto',padding:32}}>Checking your sign-in…</main>;
 if(hosted&&!userEmail)return <main style={{maxWidth:560,margin:'12vh auto',padding:32,fontFamily:'inherit'}}><Link className="brand" href={guestSubject?'/demo':'/'}><span className="brand-mark"><GraduationCap size={28}/></span><span>Boye Digital<small>SCHOOL AI</small></span></Link><h1 style={{marginTop:40}}>Sign in to your learning space</h1><p>We’ll email you a secure sign-in link. Use a parent or school-approved email address.</p><form onSubmit={signIn} style={{display:'grid',gap:12,maxWidth:400}}><label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} style={{padding:12,border:'1px solid #bbb',borderRadius:8}}/><button type="submit" style={{padding:12,borderRadius:8}} disabled={!email.trim()}>Email me a sign-in link</button></form>{authMessage&&<p role="status" style={{marginTop:16}}>{authMessage}</p>}</main>;
 function save(s:Session){setActive(s);setSessions(old=>[s,...old.filter(x=>x.id!==s.id)].slice(0,15))}
 function newChat(){setActive(fresh(active?.level,active?.topic));setQuestion('');setError('');setNotice('');setMenu(false);input.current?.focus()}
 function context(key:'level'|'topic',value:string){const s=fresh(active?.level,active?.topic);if(key==='level')s.level=value as Session['level'];else s.topic=value as Session['topic'];setActive(s);setQuestion('');setError('');setNotice('')}
 async function send(){const text=question.trim();if(lock.current||!text)return;
 const prepared = preparedAnswer(text);
 if(prepared){
   save({...fresh(active?.level,active?.topic),sample:true,title:text,messages:[{role:'user',content:text},{role:'assistant',content:prepared}]});
   setQuestion('');setError('');setNotice('');return;
 }
 lock.current=true;setBusy(true);setError('');setNotice('');const s=active?.sample?fresh(active.level,active.topic):active??fresh();const messages:Message[]=[...s.messages,{role:'user',content:text}];save({...s,messages,title:s.messages.length?s.title:text.slice(0,48)});setQuestion('');try{
 const r=await fetch(guestSubject?'/api/demo':'/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(guestSubject?{action:'tutor',subject,question:text,level:s.level}:{level:s.level,topic:s.topic,messages:messages.slice(-11)}),signal:AbortSignal.timeout(35000)});const data=await r.json();if(guestSubject && data.code === 'demo_limit'){
   save(s);setQuestion(text);setNotice(data.error);return;
 }
 if(!r.ok)throw new Error(data.error||'The tutor could not respond.');if(typeof data.content!=='string')throw new Error('Unreadable response.');save({...s,title:s.messages.length?s.title:text.slice(0,48),messages:[...messages,{role:'assistant',content:data.content}]});if(data.truncated)setNotice('This answer reached the response limit. Ask the tutor to continue.');
 }catch(e){save(s);setQuestion(text);setError(e instanceof Error&&e.name==='TimeoutError'?'The tutor took too long. Please try again.':e instanceof Error?e.message:'Please try again.')}finally{lock.current=false;setBusy(false);input.current?.focus()}}
 return <div className="app-shell">
 {menu&&<button className="scrim" aria-label="Close navigation" onClick={()=>setMenu(false)}/>}
 <aside className={`sidebar ${menu?'open':''}`}><Link className="brand" href={guestSubject?'/demo':'/'}><span className="brand-mark"><GraduationCap size={28}/></span><span>Boye Digital<small>SCHOOL AI</small></span></Link><div className="workspace-label">YOUR LEARNING SPACE</div><Link className="nav-item selected" href={guestSubject?'/demo':'/dashboard/tutors/mathematics'}><Sparkles size={19}/>{guestSubject?'Back to school demo':'AI subject tutor'}<ChevronRight size={15}/></Link>{guestSubject ? <nav aria-label="Learning subjects">
   <div className="workspace-label">LEARNING SUBJECTS</div>
   <Link className="nav-item" href="/demo/dashboard"><BookOpen size={18}/>Learning dashboard</Link>
   {(['Mathematics','English','Biology'] as const).map(name => <Link key={name} className={name === subject ? 'nav-item selected' : 'nav-item'} href={'/demo/' + demoLessons[name].slug} aria-current={name === subject ? 'page' : undefined}>{name}</Link>)}
   {subject === 'Biology' && <a className="nav-item lab-nav" href="#biology-lab"><FlaskConical size={17}/>3D Biology Lab</a>}
 </nav> : <><div className="sidebar-section"><span>CONVERSATIONS</span><button disabled={busy} onClick={newChat} aria-label="New conversation"><Plus size={18}/></button></div><button className="new-chat" disabled={busy} onClick={newChat}><Plus size={17}/>New conversation</button><div className="history">{sessions.filter(s=>s.messages.length).map(s=><button key={s.id} disabled={busy} className={active?.id===s.id?'active':''} onClick={()=>{setActive(s);setQuestion('');setError('');setNotice('');setMenu(false)}}><MessageSquare size={15}/><span>{s.title}</span></button>)}{!sessions.some(s=>s.messages.length)&&<p>Your conversations will appear here during this visit.</p>}</div></>}<div className="sidebar-bottom"><ShieldCheck size={20}/><strong>A space to learn, safely</strong><p>Use practice questions. Keep personal information out of chats.</p></div><div className="demo-profile"><span>D</span><div>Demo learner<small>Learning workspace</small></div><i/></div></aside>
 <main><header className="topbar"><div><button className="menu-toggle" aria-label="Open navigation" onClick={()=>setMenu(true)}><Menu size={22}/></button><span className="breadcrumb">Learning workspace<ChevronRight size={14}/><strong>AI subject tutor</strong></span></div><span className="demo-badge"><i/>{guestSubject?'SCHOOL DEMO':hosted?'PHASE 1 · PREVIEW':'PHASE 1 · LOCAL DEMO'}</span></header><div className="page-content"><div className="page-heading"><div><div className="eyebrow">A LITTLE CURIOSITY. A LOT OF POSSIBILITY.</div><h1>Let’s work it out, together.</h1><p>Your patient study partner, one step at a time.</p></div><span className="heading-art" aria-hidden="true">x<span>²</span><i>+</i></span></div><div className="subject-strip"><div className="subject-icon"><SubjectIcon size={24}/></div><div><span className="label">YOUR SUBJECT</span><h2>{subject}</h2></div><span className="subject-tag">AI tutor</span><div className="subject-description">Big ideas.<br/><strong>Simple explanations.</strong></div></div>
 {hosted&&<div className="preview-notice"><ShieldCheck size={18}/><p><strong>Signed in as {userEmail}.</strong> Hosted requests are limited to 30 per hour.</p><button type="button" onClick={()=>void signOut()}>Sign out</button></div>}
 {guestSubject&&<div className="preview-notice"><ShieldCheck size={18}/><p><strong>{active?.level ?? 'SS1'} demo.</strong> Suggested questions include worked answers you can explore anytime. For your own questions, each network gets three live requests per day across all subjects.</p><Link href="/demo">All subjects</Link></div>}
 {guestSubject === 'Biology' && <BiologyLab />}
 <div className="learning-grid"><section className="chat-panel" aria-label={`${subject} tutor`}><div className="chat-toolbar"><div className="context-select"><label htmlFor="level">Class level</label><select id="level" value={active?.level??'SS1'} disabled={busy} onChange={e=>context('level',e.target.value)}>{levels.map(l=><option key={l}>{l}</option>)}</select></div><div className="context-select topic-select"><label htmlFor="topic">Focus topic</label><select id="topic" value={guestSubject ? focusTopic : active?.topic??'Algebra'} disabled={busy} onChange={e=>{if(guestSubject){setFocusTopic(e.target.value);newChat()}else context('topic',e.target.value)}}>{(guestSubject ? [subjectTopics.first, ...subjectTopics.practice.map(item=>item.topic)] : topics).map(t=><option key={t}>{t}</option>)}</select></div><button className="reset" disabled={busy} onClick={newChat} aria-label="Start a new conversation"><Plus size={17}/><span>New chat</span></button></div><div className="messages" role="log" aria-label="Tutor conversation" aria-live="polite" aria-busy={busy}>
 {!active?.messages.length&&<div className="chat-welcome"><span className="tutor-avatar"><Sparkles size={28}/></span><span className="welcome-kicker">YOUR {subject.toUpperCase()} TUTOR</span><h2>Every question is a good start.</h2><p>Stuck on a problem or exploring something new?<br/>We’ll break it down and take it step by step.</p><div className="suggestions">{lesson&&!practice&&<button type="button" disabled={busy} onClick={()=>save({...fresh(active?.level,active?.topic),sample:true,title:lesson.question,messages:[{role:'user',content:lesson.question},{role:'assistant',content:lesson.answer}]})}><span><BookOpen size={17}/></span>View a worked example<ChevronRight size={16}/></button>}{prompts.map((s,i)=><button key={s} disabled={busy} onClick={()=>{setQuestion(s);input.current?.focus()}}><span>{i===2?<BookOpen size={17}/>:<Lightbulb size={17}/>}</span>{s}<ChevronRight size={16}/></button>)}</div></div>}
 {active?.messages.map((m,i)=><div className={`message ${m.role}`} key={i}><span className="message-avatar">{m.role==='assistant'?<Sparkles size={17}/>:'You'}</span><div><span className="message-label">{m.role==='assistant'?(active.sample?'Worked example':'Boye tutor · AI-generated'):'You'}</span><div className="message-content"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{m.content}</ReactMarkdown></div></div></div>)}{busy&&<div className="thinking"><Sparkles size={17}/>Working through it with you…</div>}{error&&<div className="error" role="alert"><strong>We couldn’t get an answer</strong><p>{error}</p><span>Your question is saved in the box below.</span></div>}{notice&&<div className="notice" role="status">{notice}{lesson && notice.includes('worked answers') && <details><summary>Explore worked answers</summary>{prompts.map(prompt => <details key={prompt}><summary>{prompt}</summary><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{preparedAnswer(prompt) ?? ''}</ReactMarkdown></details>)}</details>}</div>}<div ref={end}/></div>
 <div className="composer-area"><form onSubmit={e=>{e.preventDefault();void send()}}><label className="sr-only" htmlFor="question">Your {subject.toLowerCase()} question</label><textarea ref={input} id="question" placeholder="Ask a question. Let’s make it make sense…" value={question} maxLength={maxLength} rows={2} disabled={busy} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send()}}}/><button className="send" type="submit" disabled={busy||!question.trim()} aria-label="Send question"><ArrowUp size={20}/></button></form><div className="composer-note"><span><ShieldCheck size={13}/>AI can make mistakes. Check with your teacher.</span><span>{question.length}/{maxLength}</span></div></div></section>
 <aside className="learning-aside"><div className="tip-card"><Lightbulb size={23}/><span className="label">MAKE THE MOST OF YOUR TUTOR</span><h3>Understanding beats memorising.</h3><p>Try explaining what you already know. Your tutor can help you find the missing step.</p><div className="tip-example">{lesson?prompts[0]:<>“I know I need to find x, but why do we subtract 5 first?”</>}</div></div><div className="how-card"><h3>A good way to learn</h3><ol>{[['Ask your question','Tell us where you’re stuck.'],['Work through the steps','Take your time. Ask why.'],['Give it a go','Try a practice problem.']].map(([a,b],i)=><li key={a}><span>{i+1}</span><div><strong>{a}</strong><p>{b}</p></div></li>)}</ol></div><div className="session-note"><MessageSquare size={16}/><p>{guestSubject?'Live questions are sent to OpenRouter and its model provider. Chats clear when you refresh.':'Chats stay in memory for this visit only. Refreshing clears them. Changing class or topic starts a new chat.'}</p></div></aside></div><footer>Built for curious minds. Made for Nigerian classrooms.<span>Boye Digital School AI</span></footer></div></main>{menu&&<button className="close-menu" onClick={()=>setMenu(false)} aria-label="Close navigation"><X/></button>}</div>
}
