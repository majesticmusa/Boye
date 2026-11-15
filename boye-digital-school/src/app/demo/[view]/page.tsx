import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import TutorWorkspace from '@/components/tutor-workspace';
import { demoLessons, subjects } from '@/lib/demo';
import { DemoFeedback } from '../experience';
import styles from '../demo.module.css';

export function generateStaticParams() {
  return [...subjects.map(subject => demoLessons[subject].slug), 'dashboard', 'feedback'].map(view => ({ view }));
}

export default async function DemoView({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  const subject = subjects.find(name => demoLessons[name].slug === view);
  if (subject) return <TutorWorkspace guestSubject={subject} />;
  if (view !== 'dashboard' && view !== 'feedback') notFound();

  return (
    <main className={styles.page}>
      <nav className={styles.nav}><Link href="/demo"><ArrowLeft size={18} /> Back to school demo</Link></nav>
      {view === 'feedback' ? <DemoFeedback /> : (
        <section className={styles.section}>
          <h1>Learning Dashboard</h1>
          <p>Preview progress for a fictional SS1 student.</p>
          <div className={styles.sheet}>
            <h2>Sample learner · SS1</h2>
            <div className={styles.progress}>
              {subjects.map((name, index) => {
                const value = [72, 60, 80][index];
                return (
                  <div key={name}>
                    <Link href={`/demo/${demoLessons[name].slug}`}>{name}</Link>
                    <span>{value}%</span>
                    <progress aria-label={name} value={value} max={100} />
                  </div>
                );
              })}
            </div>
            <p><strong>Next practice</strong> · Linear equations</p>
          </div>
        </section>
      )}
    </main>
  );
}
