import DemoPage from './demo/page';
import TutorWorkspace from '@/components/tutor-workspace';

export default function Home() {
  // Netlify serves the public school demonstration landing page.
  // Vercel keeps the original AI learning workspace.
  if (process.env.NETLIFY === 'true') {
    return <DemoPage />;
  }

  return <TutorWorkspace hosted={Boolean(process.env.VERCEL)} />;
}
