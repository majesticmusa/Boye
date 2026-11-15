import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Calculator, ChartNoAxesCombined, FlaskConical } from 'lucide-react';
import { bookingUrl, demoLessons } from '@/lib/demo';
import { BookingLink, DemoVisit } from './experience';
import styles from './demo.module.css';

export const metadata: Metadata = {
  title: 'School Partnership Demo | Boye Digital School AI',
  description: 'Explore the Mathematics, English and Biology tutors and see sample student progress. No sign-in needed.',
};

const cards = [
  { title: 'Mathematics Tutor', ...demoLessons.Mathematics, Icon: Calculator },
  { title: 'English Tutor', ...demoLessons.English, Icon: BookOpen },
  { title: 'Biology Tutor', ...demoLessons.Biology, Icon: FlaskConical },
  { title: 'Learning Dashboard', slug: 'dashboard', description: 'Preview sample student progress.', Icon: ChartNoAxesCombined },
];

export default function DemoPage() {
  return (
    <main className={styles.landing}>
      <DemoVisit />
      <header className={styles.banner}>
        <p>BOYE DIGITAL SCHOOL AI</p>
        <h1>Experience the Future of Learning in Your School</h1>
        <div>See how AI-powered tutors can help your students learn beyond classroom hours.</div>
      </header>
      <nav className={styles.cards} aria-label="Explore the school demo">
        {cards.map(({ title, slug, description, Icon }) => (
          <Link href={`/demo/${slug}`} key={slug} className={styles.card}>
            <Icon size={23} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{description}</p>
          </Link>
        ))}
      </nav>
      <footer className={styles.partnership}>
        <h2>Interested in bringing this to your school?</h2>
        <BookingLink href={bookingUrl} />
        <Link href="/demo/feedback" className={styles.feedbackLink}>Give feedback on the demo</Link>
      </footer>
    </main>
  );
}
