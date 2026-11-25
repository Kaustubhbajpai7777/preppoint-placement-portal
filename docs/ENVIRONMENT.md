# Environment configuration

## apps/web/.env

| Variable | Meaning |
|---|---|
| `VITE_API_URL` | NestJS API base URL |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key only |
| `VITE_DEMO_MODE` | `true` for local demo, `false` for Supabase auth |
| `VITE_PREPPOINT_URL` | Optional PrepPoint application origin |

## apps/api/.env

| Variable | Meaning |
|---|---|
| `PORT` | API port, default 3001 |
| `FRONTEND_ORIGINS` | Comma-separated exact origins |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret |
| `XAI_API_KEY` | Server-only xAI API key |
| `XAI_MODEL` | xAI model identifier |
| `PREPPOINT_BASE_URL` | PrepPoint origin |
| `PREPPOINT_SSO_AUDIENCE` | Agreed SSO audience |
| `PREPPOINT_SSO_SHARED_SECRET` | Only if required by agreed protocol |

The API loads `apps/api/.env` when it starts. Restart the API after changing this file; hosted deployments can provide the same settings through their environment configuration.

Do not commit real `.env` files. Rotate any secret accidentally committed to Git.
