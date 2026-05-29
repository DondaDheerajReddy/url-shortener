# URL Shortener — Frontend

The Next.js frontend for the URL Shortener API. Lets users register, log in, shorten URLs, manage their links, and view per-link click analytics with bar charts.

---

## Features

- **Shorten URLs** — paste a long URL and get a short link instantly
- **User auth** — register and login with email or username; JWT stored in localStorage
- **Dashboard** — view all your shortened links with click counts
- **Link stats** — per-link analytics page with a click history bar chart (last 30 days)
- **Responsive UI** — CSS Modules for scoped, component-level styling

---

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Framework  | Next.js 14 (App Router)     |
| Language   | TypeScript                  |
| UI         | React 18                    |
| Charts     | Recharts                    |
| Styling    | CSS Modules                 |
| Auth       | JWT (localStorage)          |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Home page — shorten form for guests & logged-in users
│   ├── layout.tsx              # Root layout — wraps all pages with Navbar
│   ├── globals.css             # Global styles
│   ├── login/                  # Login page
│   ├── register/               # Register page
│   ├── dashboard/              # Dashboard — lists the user's shortened links
│   └── stats/                  # Stats page — per-link click analytics & bar chart
├── components/
│   ├── ShortenForm.tsx         # URL input form with optional expiry
│   ├── ShortenForm.module.css
│   ├── AuthForm.tsx            # Shared login/register form component
│   ├── AuthForm.module.css
│   ├── ClicksChart.tsx         # Recharts bar chart for daily click data
│   ├── Navbar.tsx              # Top navigation bar
│   └── Navbar.module.css
├── lib/
│   ├── api.ts                  # All fetch calls to the backend API
│   └── auth.ts                 # JWT helpers — save, read, and clear token
└── types/
    ├── index.ts                # Shared TypeScript interfaces (Link, User, Stats, etc.)
    └── declarations.d.ts       # Module declarations
```

---

## Pages

| Route        | Description                                                  | Auth required |
|--------------|--------------------------------------------------------------|---------------|
| `/`          | Home — shorten a URL; works for guests and logged-in users   | No            |
| `/register`  | Create a new account                                         | No            |
| `/login`     | Log in with email/username and password                      | No            |
| `/dashboard` | List all your links with click counts and a delete button    | Yes           |
| `/stats`     | Per-link stats — total clicks + daily bar chart (30 days)    | Yes           |

---

## Getting Started

### Prerequisites

- Node.js 18+
- The [URL Shortener backend](../backend/README.md) running locally or deployed

### Installation

```bash
git clone https://github.com/DondaDheerajReddy/url-shortener.git
cd frontend
npm install
```

### Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

The app runs at `http://localhost:3001` by default (Next.js picks the next available port if 3000 is taken by the backend).

---

## Authentication Flow

1. User logs in or registers → backend returns a JWT
2. Token is saved to `localStorage` via `lib/auth.ts`
3. `lib/api.ts` reads the token and attaches it as `Authorization: Bearer <token>` on protected requests
4. On logout, the token is cleared from `localStorage`
5. Protected pages redirect to `/login` if no token is found

---

## Backend API

This frontend expects the [URL Shortener API](../backend/README.md) to be running. All requests are made through `src/lib/api.ts`. Key endpoints used:

| Action            | Method | Endpoint                    |
|-------------------|--------|-----------------------------|
| Register          | POST   | `/auth/register`            |
| Login             | POST   | `/auth/login`               |
| Get profile       | GET    | `/auth/me`                  |
| Shorten URL       | POST   | `/shorten`                  |
| My links          | GET    | `/shorten/my-links`         |
| Link stats        | GET    | `/shorten/:code/stats`      |
| Delete link       | DELETE | `/shorten/:code`            |

---

## License

ISC
