# Ai Project Ramadan App — Medina Academy faith site

Live: https://faith.medinaacademylearning.com
Vercel project: `fathiya4545s-projects/ramadan-hub` (framework vite, output `dist`)

This is the faith side of Medina Academy: prayer times, Qur'an, azkar, Qibla,
mosque finder, sleep stories, Hajj/Umrah guides, community events and a parent
portal. It was originally called "Ramadan Hub" (hence the Vercel project name).

Not to be confused with `~/MedinaApp` — that is the separate K–7 learning
platform (Expo / React Native). Different repo, different deployment.

## Stack

React 19 + Vite 8, Tailwind v4 via `@tailwindcss/postcss`, react-router-dom 7.
Firebase auth + Firestore in the browser; `firebase-admin` in `api/`.
Leaflet / react-leaflet for the mosque finder, `web-push` for prayer
notifications, Resend for email. Lint is oxlint.

## Layout

- `src/pages/*` — routed pages (Today, Quran, Azkar, Istighfar, Names, Hajj,
  Umrah, Sleep, Parents, Calendar, Events, Media, Home, About)
- `src/components/*` — section components used by those pages
- `src/data/*` — static content (azkar, asma ul husna, reciters, sleep playlist,
  pilgrimage steps)
- `api/*` — Vercel serverless functions: `subscribe`, `unsubscribe`,
  `notify-subscribers`, `mosques`, `push/subscribe`, `push/send`; `_email.js`
  and `_firestore.js` are shared helpers
- `firestore.rules` — a copy of what is published in the Firebase console

## Conventions, and things that have bitten before

- `ADMIN_EMAILS` in `src/admins.js` is the single source of truth for whether
  admin controls are *rendered*; `firestore.rules` enforces what is actually
  *permitted* and must name the same address (currently
  `medinaacademylearning@gmail.com`). Change both together, or you get buttons
  that fail on save. Two components once drifted apart this way.
- `firestore.rules` here is a mirror of the console text. Edit one without the
  other and the wrong rules get published.
- `subscribers/` denies all browser access. Subscribing goes through
  `/api/subscribe`, which writes with the service account and bypasses rules —
  the mailing list is never readable from the page and cannot be used as open
  storage. The email address is the document id, so subscribing twice updates
  one record and does not re-send the welcome.
- `/api/notify-subscribers` verifies the caller's Firebase ID token
  server-side and checks it against the admin list. Never trust an isAdmin flag
  from the browser — anyone finding the URL could send mail from the domain.
- Mail goes one message per recipient, so nobody sees another subscriber's
  address. Unsubscribe links are HMAC-signed with `UNSUBSCRIBE_SECRET` (without
  it, editing the address in the URL unsubscribes anyone) and a
  `List-Unsubscribe` header is set. Event fields are escaped into the HTML.
- Saving and sending are separate concerns: a mail failure leaves the person
  subscribed / the event posted rather than making a success look broken.
- Only a 400 returns a message meant for the reader; anything else returns a
  generic apology. The subscribe form used to print the server's raw error,
  which named internal configuration to anyone who tried it.
- Do not name ordinary functions `use*`. React's linter treats them as Hooks —
  `useLocation` / `useFallback` in the Qibla code produced three
  rules-of-hooks errors for functions that were fine.
- `vite.config.js` carries a dev middleware that runs `api/*.js` the way Vercel
  does, because `vite dev` otherwise serves them as static files. It shims
  `res.send()` and parses `req.body` — Vercel does both for you. If a handler
  works in production but not locally, suspect that shim first.

## Env vars (set in Vercel)

`FIREBASE_SERVICE_ACCOUNT`, `RESEND_API_KEY`, `EMAIL_FROM`,
`UNSUBSCRIBE_SECRET`, `SITE_URL`, `CRON_SECRET`

## Commands

`npm run dev` · `npm run build` · `npm run preview` · `npm run lint`

## Deployment / Vercel

- Project `ramadan-hub` (`prj_1OKhuJssfnH8TS5SYJfYJ8RM02eC`), scope
  `fathiya4545s-projects` (`team_vfMYdpOAj4vkvjGwL17Gaq7x`).
- The Vercel account that owns it is **fathiyayoosef85@gmail.com** (username
  `fathiya4545`) — not the `fathiyayoosef@gmail.com` address used for git
  commits. Signed in as the wrong one, the project simply is not there.
- Deployment protection: Vercel SSO is ON for `all_except_custom_domains`. So
  every `*.vercel.app` preview URL asks for a Vercel login, and only
  `faith.medinaacademylearning.com` is publicly reachable. Share that domain,
  not a deployment URL.
- Deploys are automatic from `main` on GitHub (`Fathiya4545/ramadan-hub`).
