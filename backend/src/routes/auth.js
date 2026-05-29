import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/index.js';
import { signToken } from '../utils/auth.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
const SALT_ROUNDS = 12;  // bcrypt work factor — higher = slower = safer

/* ─────────────────────────────────────────────
   POST /auth/register
   Body: { email, username, password }
───────────────────────────────────────────── */
router.post('/register', authLimiter, async (req, res) => {
  const { email, username, password } = req.body;

  // 1. Validate all fields present
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'email, username and password are all required' });
  }

  // 2. Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // 3. Validate username — alphanumeric + underscores, 3–30 chars
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return res.status(400).json({
      error: 'Username must be 3–30 characters, letters/numbers/underscores only'
    });
  }

  // 4. Validate password strength — min 8 chars
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // 5. Check email and username aren't already taken
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      // Find out which one is taken for a helpful error message
      const takenEmail    = existing.rows.some(r => r.email === email.toLowerCase());
      const takenUsername = existing.rows.some(r => r.username === username.toLowerCase());

      if (takenEmail)    return res.status(409).json({ error: 'Email is already registered' });
      if (takenUsername) return res.status(409).json({ error: 'Username is already taken' });

      return res.status(409).json({ error: 'Email or username already taken' });
    }

    // 6. Hash the password — never store plain text
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 7. Insert the new user
    const { rows } = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, created_at`,
      [email.toLowerCase(), username.toLowerCase(), password_hash]
    );

    const user = rows[0];

    // 8. Sign a JWT and return it
    const token = signToken(user);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id:        user.id,
        email:     user.email,
        username:  user.username,
        createdAt: user.created_at,
      },
    });

  } catch (err) {
    console.error('POST /auth/register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ─────────────────────────────────────────────
   POST /auth/login
   Body: { login, password }
   "login" accepts either email OR username
───────────────────────────────────────────── */
router.post('/login', authLimiter, async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'login (email or username) and password are required' });
  }

  try {
    // Determine if "login" looks like an email or a username
    const isEmail = login.includes('@');

    const { rows } = await pool.query(
      isEmail
        ? 'SELECT * FROM users WHERE email    = $1'
        : 'SELECT * FROM users WHERE username = $1',
      [login.toLowerCase()]
    );

    if (rows.length === 0) {
      // Don't reveal whether the email/username exists — generic message
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // Compare submitted password against stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id:       user.id,
        email:    user.email,
        username: user.username,
      },
    });

  } catch (err) {
    console.error('POST /auth/login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ─────────────────────────────────────────────
   GET /auth/me
   Returns the logged-in user's profile.
   Requires: Authorization: Bearer <token>
───────────────────────────────────────────── */
router.get('/me', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, username, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(rows[0]);

  } catch (err) {
    console.error('GET /auth/me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
