import {NextResponse} from 'next/server';
import {askTutor} from '@/lib/openrouter';
import {localRequestAllowed,LocalBudget,TutorError,tutorSchema} from '@/lib/tutor';
export const runtime='nodejs';
const budget=new LocalBudget();
export async function POST(request:Request){let release:(()=>void)|undefined;try{
 if(!localRequestAllowed(request))throw new TutorError(403,'This is a Phase 1 preview. Hosted AI tutoring is not enabled yet; server authentication and an OpenRouter key must be configured first.');
 const reader=request.body?.getReader();if(!reader)throw new TutorError(400,'Enter a question.');let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>64000){await reader.cancel();throw new TutorError(413,'Request too long. Start a new conversation.')}chunks.push(value)}
 let body:unknown;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw new TutorError(400,'Send a valid JSON question.')}
 const parsed=tutorSchema.safeParse(body);if(!parsed.success)throw new TutorError(400,'Check your class, topic and question, or start a new conversation.');
 release=budget.acquire();return NextResponse.json(await askTutor(parsed.data),{headers:{'Cache-Control':'no-store'}});
 }catch(e){const safe=e instanceof TutorError?e:new TutorError(500,'The tutor could not complete your request.');return NextResponse.json({error:safe.message},{status:safe.status,headers:{'Cache-Control':'no-store',...(safe.retryAfter?{'Retry-After':String(safe.retryAfter)}:{})}})}finally{release?.()}}
