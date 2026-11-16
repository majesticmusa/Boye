import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TutorWorkspace from '../src/components/tutor-workspace';
import { subjects } from '../src/lib/demo';

for (const guestSubject of subjects) {
  test(`${guestSubject} guest tutor opens without an email gate`, () => {
    const html = renderToStaticMarkup(createElement(TutorWorkspace, { guestSubject }));
    assert.ok(html.includes(`Your ${guestSubject.toLowerCase()} question`));
    assert.ok(html.includes('Send question'));
    assert.ok(html.includes('View a worked example'));
    assert.ok(!html.includes('login-email'));
    assert.ok(!html.includes('Sign in to your learning space'));
  });
}

test('regular hosted workspace still checks authentication', () => {
  const html = renderToStaticMarkup(createElement(TutorWorkspace, { hosted: true }));
  assert.ok(html.includes('Checking your sign-in'));
  assert.ok(!html.includes('Send question'));
});
