'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import styles from './demo.module.css';

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
  return <a className={styles.bookingLink} href={href} onClick={() => {
    void submit({ action: 'booking' }, true).catch(() => {});
  }}>Book a School Partnership Demo <ArrowUpRight size={18} /></a>;
}

export function DemoVisit() {
  const visited = useRef(false);
  useEffect(() => {
    if (visited.current) return;
    visited.current = true;
    void submit({ action: 'visit' }).catch(() => {});
  }, []);
  return null;
}

export function DemoFeedback() {
  const [sending, setSending] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState('');

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
