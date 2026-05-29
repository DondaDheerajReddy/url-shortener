# URL Shortener

A full-stack URL shortening app. Paste a long URL, get a short one — with click tracking, expiry, and per-link analytics.

---

## What's Inside

| Folder | Description |
|--------|-------------|
| [`backend/`](./backend/README.md) | REST API built with Node.js, Express, PostgreSQL, and Redis |
| [`frontend/`](./frontend/README.md) | Web app built with Next.js 14 and TypeScript |

---

## Features

- Shorten any URL, with an optional expiry date
- User accounts — register, log in, manage your own links
- Redis-cached redirects for fast lookups
- Click tracking with daily analytics and bar charts
- Rate limiting on auth and shorten endpoints
- Guest shortening — no account required

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Node.js, Express, PostgreSQL, Redis     |
| Frontend  | Next.js 14, React 18, TypeScript        |
| Auth      | JWT + bcrypt                            |
| Charts    | Recharts                                |

---

## Getting Started

Each package has its own setup guide, environment variables, and run instructions — start there:

- **Backend** → [`backend/README.md`](./backend/README.md)
- **Frontend** → [`frontend/README.md`](./frontend/README.md)

The backend must be running before the frontend can make API calls.

---

## Repo Structure

```
url-shortener/
├── backend/        # Express REST API
│   └── README.md   # Backend setup & API reference
├── frontend/       # Next.js web app
│   └── README.md   # Frontend setup & page reference
└── README.md       # You are here
```

---

## License

ISC