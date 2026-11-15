import assert from 'node:assert/strict';
import { test } from 'node:test';
import { demoRequest } from '../src/lib/demo';
import { completeTutor } from '../src/lib/openrouter';

test('demo accepts only its three school subjects and bounded questions', () => {
  for (const subject of ['Mathematics', 'English', 'Biology']) {
    assert.equal(demoRequest.safeParse({ action: 'tutor', subject, question: 'Explain this.' }).success, true);
  }
  for (const [subject, question] of [['History', 'Explain this.'], ['English', ' '], ['Biology', 'x'.repeat(401)]]) {
    assert.equal(demoRequest.safeParse({ action: 'tutor', subject, question }).success, false);
  }
});

test('feedback requires storage consent and an empty honeypot, with optional follow-up', () => {
  const feedback = {
    action: 'feedback', school: 'Sample School', representative: 'Test Staff',
    email: 'staff@example.com', phone: '', feedback: 'This is a test.', consent: true, followUp: false, website: '',
  };
  assert.equal(demoRequest.safeParse(feedback).success, true);
  assert.equal(demoRequest.safeParse({ ...feedback, consent: false }).success, false);
  assert.equal(demoRequest.safeParse({ ...feedback, website: 'spam.example' }).success, false);
});

test('demo forces the free router and its own output cap', async () => {
  const saved = { key: process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL };
  process.env.OPENROUTER_API_KEY = 'test-only';
  process.env.OPENROUTER_MODEL = 'example/paid-model';
  try {
    const answer = await completeTutor('Test prompt', [{ role: 'user', content: 'Question' }],
      { freeOnly: true, maxTokens: 450 }, async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        assert.equal(body.model, 'openrouter/free');
        assert.equal(body.max_tokens, 450);
        return Response.json({ choices: [{ message: { content: 'Answer' }, finish_reason: 'stop' }] });
      });
    assert.equal(answer.content, 'Answer');
  } finally {
    if (saved.key === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = saved.key;
    if (saved.model === undefined) delete process.env.OPENROUTER_MODEL;
    else process.env.OPENROUTER_MODEL = saved.model;
  }
});
