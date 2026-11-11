import TutorWorkspace from '@/components/tutor-workspace';
export default function Home(){return <TutorWorkspace hosted={Boolean(process.env.VERCEL)}/>}
