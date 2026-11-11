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

The initial deployment is a UI preview. It does not need secrets to build. Hosted tutoring remains disabled in code until server authentication and durable quotas are implemented. Adding an OpenRouter key alone does not enable it. Configure any future key only in Vercel's server environment variables, never in GitHub source or browser-visible variables.

The GitHub push preserves the existing files at the repository root. No secrets, local environment files, build output or dependencies are included.
