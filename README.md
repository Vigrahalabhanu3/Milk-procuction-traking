# DairyFlow

Milk collection management frontend built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Run locally

Use Node.js 20.9 or later. Install dependencies with `npm install`, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_BASE_URL` (default `http://127.0.0.1:8000`), then run `npm run dev`.

Open http://localhost:3000. The backend must allow the frontend origin and the Authorization and Content-Type headers through CORS.

## Login and accounts

The homepage links to one login page at `/login`, with Farmer and Admin toggle buttons. `/login?role=admin` selects the Admin tab. Each account type uses its own backend authentication endpoint and role checks. There is no public registration or admin registration. Admins create farmer accounts inside their dashboard.

Access tokens and users are stored in tab-scoped session storage so refreshing preserves sign-in. Sessions retain their original 30-minute expiry and end when a protected request returns 401. Refresh tokens and passwords are never persisted. Expiry and logout return to the appropriate tab of the shared login page.

## Connected pages

- Admin: overview, farmer directory, register farmer, add milk collection, collections, monthly earnings, reports, and notification dispatch.
- Farmer: dashboard, collections, monthly earnings, notifications, and profile.

All business records come from the configured API. Empty, loading, and error states are shown explicitly. Collection and notification creation require HTTP 201. Backend field errors appear beside the inputs. Role guards complement backend authorization.

Monthly earnings represent saved milk collection value, not payment received or an outstanding balance. Reports support filtered JSON previews and authenticated CSV downloads of the full filtered dataset.

Unused mock services, disconnected quality/detail pages, public registration, and the retired admin settings, analytics, announcements, audit logs, and milk rates pages have been removed. Shared authenticated queries handle loading, stale responses, retries, role checks, and data-change events.

## Checks

- `npm test`: controlled API and authentication tests; does not create backend records.
- `npm run lint`
- `npm run build -- --webpack`
