import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, GraduationCap, ShieldCheck } from 'lucide-react';
import { bookingUrl } from '@/lib/demo';
import { BookingLink, DemoExperience } from './experience';
import styles from './demo.module.css';

export const metadata: Metadata = {
  title: 'School Partnership Demo | Boye Digital School AI',
  description: 'Try AI tutoring for Mathematics, English and Biology, and explore a fictional student dashboard built for private secondary schools in Port Harcourt.',
};

export default function DemoPage() {
  return <main className={styles.page}>
    <header className={styles.nav}>
      <Link href="/demo" className={styles.brand}><GraduationCap size={28} /> Boye Digital School AI</Link>
      <Link href="/">Student sign-in <ArrowUpRight size={16} /></Link>
    </header>
    <section className={styles.hero}>
      <div>
        <p className={styles.kicker}>FOR PRIVATE SECONDARY SCHOOLS IN PORT HARCOURT</p>
        <h1>Give students a place to keep learning after class.</h1>
        <p>Experience how AI tutors can explain a difficult topic, guide students through practice, and help them see what to work on next.</p>
        <a className={styles.yellow} href="#try-tutors">Try the AI tutors <ArrowDown size={18} /></a>
      </div>
      <aside>
        <ShieldCheck size={30} />
        <h2>Explore before you partner</h2>
        <p>Ask a few practice questions and view a fictional student dashboard. No account is needed.</p>
        <p>This demo is illustrative. A full school deployment requires a separate partnership.</p>
      </aside>
    </section>
    <DemoExperience />
    <footer className={styles.footer}>
      <div><h2>Bring Boye Digital School AI to your school</h2><p>Let’s discuss your subjects, rollout and school support needs.</p></div>
      <BookingLink href={bookingUrl} />
    </footer>
  </main>;
}
