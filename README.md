# Placement Preparation Portal

A full-stack starter implementation for the Placement Preparation Portal, built with:
- **Frontend:** React, Vite, TypeScript, React Router, Tailwind CSS
- **Backend:** NestJS, TypeScript
- **Data/auth:** Supabase (PostgreSQL + Supabase Auth + RLS)
- **AI:** xAI/Grok via the NestJS backend only

This repository is designed to run locally immediately in **demo mode**. Supabase, xAI, and PrepPoint SSO become live after you supply valid credentials and configure the corresponding deployed origins. No real assessment data is fabricated: demo content is visibly labelled as sample data.

## Requirements

- Node.js 20.19+ (or 22.12+), npm 10+
- A Supabase project for live authentication/data
- Optional xAI API key for resume analysis
- Optional PrepPoint SSO issuer/audience configuration

## Quick start (Windows PowerShell)

```powershell
# 1. Extract the ZIP and open this folder in VS Code
# 2. Install all dependencies
npm install

# 3. Create local environment files
Copy-Item apps/web/.env.example apps/web/.env
Copy-Item apps/api/.env.example apps/api/.env

# 4. Start frontend + backend
npm run dev
```

Open:
- Frontend: http://localhost:5173
- Backend health: http://localhost:3001/api/health

The portal starts in demo mode without credentials. Use the demo sign-in option on the login screen.

## Live Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql`.
3. Copy the project URL and anon key into `apps/web/.env`.
4. Copy the project URL and service role key into `apps/api/.env`. **Never put the service role key in the frontend.**
5. Set `VITE_DEMO_MODE=false` in the frontend environment.
6. Configure Supabase Auth email/password sign-in and your allowed redirect URLs.
7. Restart the app.

The backend uses the service role key only server-side and verifies bearer tokens before protected requests. Database tables have RLS policies. Review and adapt policies before production deployment.

## Optional AI resume analysis

Set `XAI_API_KEY` in `apps/api/.env`. The browser uploads the resume to the NestJS API; the API extracts supported text and calls xAI. The key is never exposed to Vite/browser code. PDF and DOCX parsing are supported; scanned-image PDFs need OCR, which is not included. The result is an estimate, not a guarantee of employer ATS outcomes.

## PrepPoint SSO

The portal includes an authenticated launch entry and a backend SSO handoff endpoint. It deliberately does **not** claim SSO works merely because both apps use the same Supabase project. Configure:
- `PREPPOINT_BASE_URL`
- `PREPPOINT_SSO_AUDIENCE`
- `PREPPOINT_SSO_SHARED_SECRET` (only if the PrepPoint team has agreed to this exact server-to-server protocol)

The included handoff endpoint is an integration contract placeholder. It returns a clear `501` until a real, mutually agreed OIDC/JWT exchange is implemented. Do not put long-lived access tokens in URLs. Coordinate the protocol, signing keys, issuer, audience, expiry, nonce/state, and callback URLs with the PrepPoint/database team before enabling it.

## Scripts

From the repository root:

```bash
npm run dev          # web + api concurrently
npm run build        # build both applications
npm run lint         # type-check frontend and backend
npm run test         # backend unit tests
```

Or run individually:
```bash
npm run dev:web
npm run dev:api
```

## Implemented pages

- Landing page
- Sign in / sign up (demo auth or Supabase Auth)
- Student dashboard
- Performance dashboard (real Supabase data when configured; labelled demo sample data otherwise)
- Learning roadmap
- PrepPoint assessment launch / SSO status
- Technical and HR question banks
- Coding practice resources
- Resume analyzer (demo analysis clearly labelled; live xAI when configured)
- Placement and internship opportunities
- Examiner content workspace
- Management overview
- Profile and settings

## Important integration boundaries

- No duplicate timed assessment engine is included.
- Assessment tests, question palette, answer selection, anti-cheating, submission, and grading remain PrepPoint's responsibility.
- `performance_history` has no percentage column.
- No topic-level performance table is created.
- Mock interview scheduling and AI interview feedback are intentionally excluded.
- Demo data is only for local UI demonstration and is explicitly marked.
- Production deployment requires real secrets, domain/CORS configuration, email setup, security review, and end-to-end testing.

## Deployment outline

- Frontend: Vercel (`apps/web`, Vite build command `npm run build`, output `dist`)
- Backend: Render (`apps/api`, build `npm run build`, start `npm run start:prod`)
- Database/Auth/storage: Supabase

Set production environment variables in the respective hosting dashboards. Restrict CORS to the deployed frontend origin. Never commit `.env` files.
