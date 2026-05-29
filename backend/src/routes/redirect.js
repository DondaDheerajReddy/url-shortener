import express from 'express';
import { pool } from '../db/index.js';
import redis from '../utils/redis.js';

const router = express.Router();

const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

router.get('/:code', async (req, res) => {
  const { code } = req.params;

  if (!/^[a-zA-Z0-9]{1,20}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid short code format' });
  }

  try {
    // 1. Check Redis cache first
    const cached = await redis.get(`url:${code}`);

    if (cached) {
      const { id: urlId, original } = JSON.parse(cached);

      // Record click in background
      pool.query(
        'INSERT INTO clicks (url_id) VALUES ($1)',
        [urlId]
      ).catch(err => console.error('Failed to record click:', err));

      console.log(`Cache HIT for code: ${code}`);
      return res.redirect(302, original);
    }

    // 2. Cache miss — query Postgres
    console.log(`Cache MISS for code: ${code}`);

    const { rows } = await pool.query(
      `SELECT id, original, expires_at FROM urls WHERE code = $1`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const { id: urlId, original, expires_at } = rows[0];

    if (expires_at && new Date(expires_at) < new Date()) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    // 3. Store in Redis for next time
    await redis.setex(
      `url:${code}`,
      CACHE_TTL,
      JSON.stringify({ id: urlId, original })
    );

    // Record click in background
    pool.query(
      'INSERT INTO clicks (url_id) VALUES ($1)',
      [urlId]
    ).catch(err => console.error('Failed to record click:', err));

    return res.redirect(302, original);

  } catch (err) {
    console.error('GET /:code error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;