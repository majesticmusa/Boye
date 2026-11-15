# Import from GitHub into Vercel

Repository: `majesticmusa/Boye`
Branch: `main`
Root Directory: `boye-digital-school` (required: the repository root contains a different project)
Framework: Next.js
Node.js: 24.x
Install command: `npm ci`
Build command: `npm run build`
Output Directory: leave at the Next.js default, with no override.

For the existing Vercel project, connect this repository under Settings → Git, then set Root Directory under the project's build settings and trigger a deployment of main. For a new import, select this repository and root directory before clicking Deploy.

The app uses Supabase email magic-link authentication and a database-backed hourly tutor quota. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production and Preview. In Supabase Auth URL Configuration, set the production Site URL and allow `https://<your-domain>/auth/callback` (plus the matching Vercel preview callback if needed). Configure `OPENROUTER_API_KEY` as a server-only Vercel secret for Production and Preview; never put provider keys in GitHub source or browser-visible variables.

The GitHub push preserves the existing files at the repository root. No secrets, local environment files, build output or dependencies are included.

## Public school partnership demo
Apply the migration in `supabase/migrations` before enabling the public demo.
Set `SUPABASE_SERVICE_ROLE_KEY` and a random `DEMO_RATE_LIMIT_SECRET`
(at least 32 random bytes) in Vercel as server-only secrets. The demo uses the
existing Supabase URL and OpenRouter key and always calls the free-model router.
Use a separate Supabase project for previews that should not share production
feedback or daily limits. Requests fail closed if the database or secrets are missing.

The demo permits three AI requests per network address and 20 total per day,
reset at midnight in Lagos. Provider attempts count even if the call fails.
Feedback and analytics have separate limits. On Vercel, the limiter uses the
ingress-set client IP header, HMACed server-side. Local testing shares one bucket.

Read inquiries from `school_demo.feedback` in the Supabase SQL editor.
Contact only rows with `follow_up = true`. Review event counts in
`school_demo.events`. Booking events record a click, not a confirmed appointment.
The demo does not send outreach or feedback emails. Set a retention schedule
before public launch for feedback, events and expired rate-limit rows.
