import {NextResponse} from 'next/server';
import {askTutor} from '@/lib/openrouter';
import {localRequestAllowed,LocalBudget,TutorError,tutorSchema} from '@/lib/tutor';
import {createClient} from '@/lib/supabase/server';
export const runtime='nodejs';
const budget=new LocalBudget();
export async function POST(request:Request){let release:(()=>void)|undefined;try{
 const local=localRequestAllowed(request);
 const reader=request.body?.getReader();if(!reader)throw new TutorError(400,'Enter a question.');let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>64000){await reader.cancel();throw new TutorError(413,'Request too long. Start a new conversation.')}chunks.push(value)}
 let body:unknown;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw new TutorError(400,'Send a valid JSON question.')}
 const parsed=tutorSchema.safeParse(body);if(!parsed.success)throw new TutorError(400,'Check your class, topic and question, or start a new conversation.');
 if(!local){
  const supabase=await createClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user)throw new TutorError(401,'Sign in to use the tutor.');
  const {data:allowed,error:quotaError}=await supabase.rpc('consume_tutor_quota');
  if(quotaError)throw new TutorError(503,'The tutor is temporarily unavailable. Please try again later.');
  if(!allowed)throw new TutorError(429,'You have reached the hourly tutor limit. Please try again later.',3600);
 }
 if(local)release=budget.acquire();return NextResponse.json(await askTutor(parsed.data),{headers:{'Cache-Control':'no-store'}});
 }catch(e){const safe=e instanceof TutorError?e:new TutorError(500,'The tutor could not complete your request.');return NextResponse.json({error:safe.message},{status:safe.status,headers:{'Cache-Control':'no-store',...(safe.retryAfter?{'Retry-After':String(safe.retryAfter)}:{})}})}finally{release?.()}}
