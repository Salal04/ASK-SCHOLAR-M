# Ask Scholar — Frontend (Vite + React)

## Setup

```bash
cd ask-scholar-frontend
npm install
cp .env.example .env
# edit .env if your backend isn't on http://localhost:5000
npm run dev
```

Runs at `http://localhost:5173`. Make sure the backend is running and its
`FRONTEND_ORIGIN` in `.env` is set to `http://localhost:5173` (CORS).

## Pages / Routes

| Route | Access | Description |
|---|---|---|
| `/scholars` | Public | Browse, search, and filter scholars (fiqah, location, language) |
| `/scholars/:id` | Public (chat needs login) | View a scholar's profile and ask a question |
| `/login` | Public | User login |
| `/signup` | Public | User sign-up |
| `/admin/login` | Public | Admin login |
| `/admin` | Admin only | Create/invite scholars, manage scholars & users (delete, suspend) |

## Ask-a-question flow

- Q&A pairs are stored in **`sessionStorage`**, keyed per scholar (`askScholar_chat_<scholarId>`),
  so they persist across page navigation within the tab but clear when the tab closes.
- Each new question is sent to `POST /api/scholars/:id/ask` along with a `history` string:
  the prior conversation transcript, **capped to the most recent 2000 words** (see
  `src/utils/history.js` → `buildHistoryText`), so old, less-relevant context gets trimmed
  as the conversation grows.
- The chat panel only renders for logged-in **users** (not admins); scholars/guests see a
  "log in to ask" prompt instead.

> **Note on the backend's `/ask` endpoint:** it currently returns a placeholder
> acknowledgement rather than a generated answer — this repo deliberately does not
> auto-generate religious rulings. Wire that endpoint up to your real answering flow
> (e.g. routing to the actual scholar, or a reviewed knowledge base) before going live.

## Auth model

A single `AuthContext` holds `{ role: 'ADMIN' | 'USER', token, profile }`, persisted to
`localStorage` so refreshing the page keeps the session. `ProtectedRoute` redirects to
the right login page if the role doesn't match.

## Design notes

Palette and type are deliberately not the generic cream/terracotta AI-app default —
deep teal + brass gold, evoking mosque tilework, with a restrained 8-point geometric
star as the one signature motif (hero background, chat empty state). Display face is
Fraunces, body is Work Sans, and small meta/tag text uses IBM Plex Mono.
