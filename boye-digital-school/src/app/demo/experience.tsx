'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, BookOpen, Calculator, FlaskConical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { subjects } from '@/lib/demo';
import styles from './demo.module.css';

const samples = [
  'How do I solve 2x + 5 = 17?',
  'How can I identify the main idea in a paragraph?',
  'How does photosynthesis help a plant grow?',
];
const icons = [Calculator, BookOpen, FlaskConical];
const descriptions = ['Work through an algebra problem.', 'Practise grammar and comprehension.', 'Explore how living things work.'];

async function submit(payload: object, keepalive = false) {
  const response = await fetch('/api/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(35000),
    keepalive,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
}

export function BookingLink({ href }: { href: string }) {
  return <a className={styles.yellow} href={href} onClick={() => {
    void submit({ action: 'booking' }, true).catch(() => {});
  }}>Book a school partnership call <ArrowUpRight size={18} /></a>;
}

export function DemoExperience() {
  const visited = useRef(false);
  const [subject, setSubject] = useState<(typeof subjects)[number]>('Mathematics');
  const [question, setQuestion] = useState(samples[0]);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState('');
  useEffect(() => {
    if (visited.current) return;
    visited.current = true;
    void submit({ action: 'visit' }).catch(() => {});
  }, []);

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !question.trim()) return;
    setBusy(true);
    setAnswer('');
    setError('');
    try {
      const data = await submit({ action: 'tutor', subject, question });
      setAnswer(data.content);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  async function sendFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setSending(true);
    setFeedbackStatus('');
    try {
      await submit({
        action: 'feedback',
        school: fields.get('school'), representative: fields.get('representative'),
        email: fields.get('email'), phone: fields.get('phone'),
        feedback: fields.get('feedback'), website: fields.get('website'),
        consent: fields.has('consent'), followUp: fields.has('followUp'),
      });
      form.reset();
      setFeedbackStatus('Thank you. Your feedback was received.');
    } catch (cause) {
      setFeedbackStatus(cause instanceof Error ? cause.message : 'Try again in a moment.');
    } finally {
      setSending(false);
    }
  }

  return <>
    <section className={styles.section} id="try-tutors">
      <h2>Try a subject tutor</h2>
      <p>Send up to three practice questions per network each day, subject to the shared daily limit. Avoid names, contact details and student records.</p>
      <div className={styles.subjects} role="group" aria-label="Choose a subject">
        {subjects.map((name, index) => {
          const Icon = icons[index];
          return <button type="button" key={name} disabled={busy} aria-pressed={subject === name} onClick={() => {
            setSubject(name); setQuestion(samples[index]); setAnswer(''); setError('');
          }}><Icon size={22} /><strong>{name}</strong><span>{descriptions[index]}</span></button>;
        })}
      </div>
      <form className={styles.sheet} onSubmit={ask}>
        <label htmlFor="demo-question">Your {subject} question</label>
        <textarea id="demo-question" required rows={3} maxLength={400} value={question} disabled={busy} onChange={event => setQuestion(event.target.value)} />
        <button className={styles.primary} disabled={busy || !question.trim()}>{busy ? 'Preparing an answer…' : 'Ask the tutor'}</button>
        <div aria-live="polite" aria-busy={busy}>
          {error && <p role="alert">{error}</p>}
          {answer && <div className={styles.answer}><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{answer}</ReactMarkdown></div>}
        </div>
        <small>Questions go to OpenRouter and its model provider. Boye Digital does not store question or answer text in demo analytics. AI can make mistakes.</small>
      </form>
    </section>
    <section className={styles.section}>
      <h2>See what a student dashboard could show</h2>
      <p>All names, activity and progress below are fictional.</p>
      <div className={styles.sheet}>
        <h3>Sample learner · SS1</h3>
        <div className={styles.progress}>
          {[['Mathematics', 72], ['English', 60], ['Biology', 80]].map(([name, value]) =>
            <div key={name}><strong>{name}</strong><span>{value}%</span><progress aria-label={String(name)} value={Number(value)} max={100} /></div>
          )}
        </div>
        <p><strong>Next practice</strong> · Linear equations</p>
      </div>
    </section>
    <section className={styles.section}>
      <h2>Tell us what your school needs</h2>
      <p>Share what would make the platform useful for your school. Use official school contact details and leave out student information.</p>
      <form className={styles.sheet} onSubmit={sendFeedback}>
        <div className={styles.fields}>
          <label>School name<input name="school" required minLength={2} maxLength={120} /></label>
          <label>Representative’s name<input name="representative" required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label>Official school email<input type="email" name="email" required maxLength={254} /></label>
          <label>Official phone (optional)<input type="tel" name="phone" maxLength={25} /></label>
        </div>
        <label>Feedback<textarea name="feedback" required minLength={5} maxLength={1200} rows={4} /></label>
        <div hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className={styles.check}><input type="checkbox" name="consent" required /> I agree to Boye Digital storing these details to review my feedback.</label>
        <label className={styles.check}><input type="checkbox" name="followUp" /> Boye Digital may contact me about a school partnership.</label>
        <button className={styles.primary} disabled={sending}>{sending ? 'Submitting…' : 'Submit feedback'}</button>
        <p role="status">{feedbackStatus}</p>
      </form>
    </section>
    <p className={styles.privacy}>We count visits, tutor requests, feedback submissions and booking clicks. A protected identifier derived from your network address helps enforce limits. We use no demo tracking cookies.</p>
  </>;
}
