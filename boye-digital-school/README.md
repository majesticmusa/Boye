# Boye Digital School AI — Phase 1

Next.js, TypeScript, Tailwind, Lucide, Zod and server-side OpenRouter Mathematics tutor. Supports JSS1–SS3, topic selection, follow-up conversations, visit-only chat history, Markdown and mathematical notation.

## Local setup

Node 24 recommended. Run `npm ci`, copy `.env.example` to `.env.local`, add your OpenRouter key privately and set `TUTOR_LOCAL_DEMO=true`. Run `npm run dev` and open http://127.0.0.1:3000. Ask “Help me solve 2x + 5 = 17” and a follow-up question. Restart after changing environment variables. Never paste secrets into chat or commit them.

The default model is `openrouter/free`; change `OPENROUTER_MODEL` to switch models. Free models have quotas and availability limits. The public catalogue listed this model during the initial build, but a live completion has not been verified because no key was supplied.

## Vercel preview

The hosted page is an explorable Phase 1 preview. Hosted AI requests are explicitly disabled until authentication, durable quotas and the server API key are configured. The page shows this limitation; no fabricated AI responses are provided. Setting `TUTOR_LOCAL_DEMO=true` cannot enable the endpoint on Vercel.

Vercel deployment uses Next.js detection, `npm ci`, `npm run build` and Node 24. Environment files are excluded. Source-file deployment does not imply GitHub synchronization.

## Checks

Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`. Tests cover request validation, limits, local-only gating, hosted API denial, mocked provider responses, provider failures and timeouts. Mock tests are not a live integration test.

## Limits and next phase

This is not the complete MVP. Supabase authentication, tenant isolation, database persistence, quizzes, teacher review, support and administration remain Phase 2 onward. The environment template reserves both Supabase publishable and legacy anon names; neither is used yet. No grades or student progress are fabricated.

Chat history is held in browser memory only and clears on refresh. The last 11 messages are sent, bounded to 24,000 characters and 64 KB of request data. Output is capped at 900 tokens with a 30-second timeout and no automatic retries. Local limits are one in-flight call, five/minute and thirty/hour per process; these are not distributed student/school quotas.

Do not expose the local server using tunnels or public interfaces. The local origin check is not authentication. Before enabling hosted tutoring, implement server-verified sessions, RLS, shared quotas, teacher escalation, retention controls and tenant-isolation tests. Before any real-student pilot, obtain school authorisation and appropriate guardian consent, publish privacy notices, review applicable Nigerian data-protection obligations, and define incident handling and provider data handling. Use fictional data only.

The workspace was refreshed during deployment; source was restored from this conversation and must be verified again. No live API success or browser testing is claimed without recorded evidence.
