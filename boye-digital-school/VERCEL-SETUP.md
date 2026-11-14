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
