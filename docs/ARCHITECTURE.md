# Architecture and security notes

## Runtime topology

```text
Browser (React/Vite)
  ├─ Supabase Auth (anon key; user session)
  └─ NestJS REST API (Bearer access token)
       ├─ Supabase service client (server-only)
       ├─ xAI/Grok API (server-only key)
       └─ PrepPoint SSO adapter (not enabled until protocol agreed)

Supabase
  ├─ profiles
  ├─ performance_history
  ├─ learning_resources
  ├─ opportunities
  └─ roadmap_progress
```

## Trust boundaries

- Browser code is public. Never store service role keys or xAI secrets in `VITE_*` variables.
- Protected API routes validate Supabase access tokens through `auth.getUser(token)`.
- The server uses a service-role client only after authenticating the user. Add server-side role checks for every examiner/management mutation before enabling those endpoints.
- RLS remains enabled. Review policies against your institution's exact role and ownership model.
- PrepPoint must write assessment results through its trusted server or another explicitly authorized server-side integration.
- SSO must be an agreed protocol, not a URL containing an access token.

## Data constraints

`performance_history` stores raw `score` and `total_marks`; it has no percentage field. There is no topic-level performance table. Dashboard percentage display, if later added, must be derived at read time and explained.

## Production hardening checklist

- Configure exact production CORS origins.
- Add API rate limiting, request logging with secret redaction, CSRF strategy where cookie auth is used, and security headers.
- Add strict MIME sniffing/file validation and malware scanning for uploaded resumes.
- Use private object storage and retention/deletion policy if resume files are persisted. Current API processes in memory and does not persist the uploaded file.
- Add server-side role guards and audit logs for staff APIs before enabling management mutations.
- Add refresh/session lifecycle handling, email verification, password reset, and account recovery UX.
- Implement and test the agreed PrepPoint SSO protocol.
- Add integration tests against a staging Supabase project and deployed origins.
