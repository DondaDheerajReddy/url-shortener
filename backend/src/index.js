import 'dotenv/config';
import express from "express";
import {initSchema} from "./db/index.js";
import authRouter    from './routes/auth.js';
import shortenRouter from "./routes/shorten.js";
import redirectRouter from "./routes/redirect.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth',    authRouter);
app.use('/shorten', shortenRouter);
app.use('/', redirectRouter);       // Must come last — catches /:code

// ─── 404 fallback ─────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ─── Start ────────────────────────────────────────────────────────────────
async function start() {
  await initSchema();               // Ensure DB table exists
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app; // exported for testing