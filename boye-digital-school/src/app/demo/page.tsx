import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Calculator, BarChart3, FlaskConical } from 'lucide-react';
import styles from './demo.module.css';

export const metadata: Metadata = {
  title: 'Boye Digital School AI',
  description: 'Explore AI powered learning subjects for your school.',
};

const learningUrl = 'https://boye-b755.vercel.app/';
const bookingUrl = 'https://www.boyedigital.com.ng/service-booking';

const subjects = [
  { title: 'Mathematics Tutor', description: 'Try a sample SS1 lesson.', Icon: Calculator },
  { title: 'English Tutor', description: 'Explore grammar and comprehension.', Icon: BookOpen },
  { title: 'Biology Tutor', description: 'Explore science explanations.', Icon: FlaskConical },
  { title: 'Learning Dashboard', description: 'Preview sample student progress.', Icon: BarChart3 },
];

export default function DemoPage() {
  return <main className={styles.page}>
    <header className={styles.hero}>
      <p className={styles.kicker}>BOYE DIGITAL SCHOOL AI</p>
      <h1>Experience the Future of Learning in Your School</h1>
      <p>See how AI-powered tutors can help your students learn beyond classroom hours.</p>
    </header>

    <section className={styles.subjects} aria-label="Explore learning subjects">
      {subjects.map(({ title, description, Icon }) =>
        <a className={styles.card} href={learningUrl} key={title}>
          <Icon size={21} aria-hidden="true" />
          <strong>{title}</strong>
          <span>{description}</span>
        </a>
      )}
    </section>

    <footer className={styles.footer}>
      <strong>Interested in bringing this to your school?</strong>
      <Link className={styles.booking} href={bookingUrl}>
        Book a School Partnership Demo <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
      <p>Illustrative concept for the public demonstration page.</p>
    </footer>
  </main>;
}
