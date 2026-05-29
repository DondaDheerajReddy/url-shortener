# URL Shortener API

A fast, production-ready URL shortening backend built with Node.js, Express, PostgreSQL, and Redis.

## Features

- **Shorten URLs** — guests and authenticated users can shorten links
- **Custom expiry** — set links to expire after 1–365 days
- **Redirect with caching** — Redis-backed redirects for low-latency lookups
- **Click tracking** — per-link click counts and daily breakdowns (last 30 days)
- **User accounts** — register, login (email or username), JWT auth
- **Link management** — view and delete your own links
- **Rate limiting** — separate limiters for auth and shortening endpoints
- **Deduplication** — avoids creating duplicate short codes for the same user/URL

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Runtime    | Node.js (ESM)                     |
| Framework  | Express 4                         |
| Database   | PostgreSQL (`pg`)                 |
| Cache      | Redis (`ioredis`)                 |
| Auth       | JWT (`jsonwebtoken`) + bcrypt     |
| Rate Limit | `express-rate-limit`              |
| Testing    | Jest + Supertest                  |

---

## Project Structure

```
src/
├── index.js               # App entry point — wires middleware, routes, starts server
├── db/
│   └── index.js           # PostgreSQL pool + schema init
├── middleware/
│   ├── authenticate.js    # JWT auth middleware (strict + optional variants)
│   └── rateLimiter.js     # Rate limiters for auth and shorten routes
├── routes/
│   ├── auth.js            # /auth — register, login, profile
│   ├── shorten.js         # /shorten — create, info, stats, delete, my-links
│   └── redirect.js        # /:code — redirect with Redis cache + click tracking
└── utils/
    ├── auth.js            # JWT sign/verify helpers
    ├── codeGenerator.js   # Base62 encoder (row ID → short code)
    ├── redis.js           # ioredis client with retry strategy
    └── validateUrl.js     # URL validation helper
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Installation

```bash
git clone https://github.com/DondaDheerajReddy/url-shortener.git
cd url-shortener
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the backend folder:

```env
PORT=3000
BASE_URL=http://localhost:3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=url_shortener
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES=7d
```

### Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server initializes the database schema on startup — no separate migration step needed.

---

## API Reference

### Health

```
GET /health
```
Returns `{ "status": "ok" }`.

---

### Auth — `/auth`

#### Register
```
POST /auth/register
Body: { "email": "...", "username": "...", "password": "..." }
```

#### Login
```
POST /auth/login
Body: { "login": "<email or username>", "password": "..." }
```
Returns a JWT token.

#### Get Profile
```
GET /auth/me
Authorization: Bearer <token>
```

---

### Shorten — `/shorten`

#### Create a Short Link
```
POST /shorten
Body: { "url": "https://example.com", "expiresInDays": 30 }
Authorization: Bearer <token>  (optional — guests can shorten too)
```
`expiresInDays` is optional (1–365). Authenticated users get links tied to their account.

#### Get Link Info
```
GET /shorten/:code/info
```

#### Get Link Stats (owner only)
```
GET /shorten/:code/stats
Authorization: Bearer <token>
```
Returns total clicks and daily click counts for the last 30 days.

#### List My Links
```
GET /shorten/my-links
Authorization: Bearer <token>
```

#### Delete a Link (owner only)
```
DELETE /shorten/:code
Authorization: Bearer <token>
```

---

### Redirect

```
GET /:code
```
Redirects to the original URL (HTTP 302). Checks Redis first; falls back to Postgres on a cache miss. Returns 410 for expired links.

---

## How Short Codes Work

Row IDs from the `urls` table are encoded to Base62 (`[a-zA-Z0-9]`), giving compact codes like `aB3x`. The insert uses a two-step transaction: a placeholder row is inserted to get the auto-increment ID, the ID is encoded, and then the row is updated — guaranteeing uniqueness without a separate counter table.

---

## Testing

```bash
npm test
```

Uses Jest and Supertest. Tests run serially (`--runInBand`) to avoid race conditions on the shared database.

---

## License

ISC
