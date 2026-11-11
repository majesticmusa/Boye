import {z} from 'zod';
import {TutorError,tutorPrompt,type TutorInput} from './tutor';
const output=z.object({choices:z.array(z.object({message:z.object({content:z.string().trim().min(1).max(16000)}),finish_reason:z.string().nullish()})).min(1)});
export async function askTutor(input:TutorInput,fetcher:typeof fetch=fetch){
 const key=process.env.OPENROUTER_API_KEY;if(!key)throw new TutorError(503,'Add the OpenRouter API key to the server configuration and restart the app.');
 try{
  const r=await fetcher('https://openrouter.ai/api/v1/chat/completions',{method:'POST',cache:'no-store',signal:AbortSignal.timeout(30000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','X-OpenRouter-Title':'Boye Digital School AI'},body:JSON.stringify({model:process.env.OPENROUTER_MODEL||'openrouter/free',max_tokens:900,temperature:.4,messages:[{role:'system',content:tutorPrompt(input)},...input.messages]})});
  if(r.status===429)throw new TutorError(429,'The AI provider is busy or its free-model quota is exhausted. Try again later.',60);
  if([401,402,403].includes(r.status))throw new TutorError(503,'Check the server API key and provider account credits.');
  if(!r.ok)throw new TutorError(502,'The AI provider is temporarily unavailable.');
  const parsed=output.safeParse(await r.json());if(!parsed.success)throw new TutorError(502,'The AI provider returned an unreadable response.');
  return {content:parsed.data.choices[0].message.content,truncated:parsed.data.choices[0].finish_reason==='length'};
 }catch(e){if(e instanceof TutorError)throw e;if(e instanceof Error&&['TimeoutError','AbortError'].includes(e.name))throw new TutorError(504,'The tutor took too long. Please try again.');throw new TutorError(502,'Could not reach the AI provider. Please try again.');}
}
