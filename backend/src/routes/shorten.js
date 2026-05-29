import express from 'express';
import { pool } from '../db/index.js';
import { toBase62 } from '../utils/codeGenerator.js';
import validateUrl from '../utils/validateUrl.js';
import { authenticate, optionalAuth } from '../middleware/authenticate.js';
import { shortenLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/* ─────────────────────────────────────────────
   POST /shorten
   optionalAuth — guests can shorten, logged-in
   users get the link tied to their account.
───────────────────────────────────────────── */
router.post('/', optionalAuth, shortenLimiter, async (req, res) => {
  const { url, expiresInDays } = req.body;
  const validation = validateUrl(url);

  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  let expiresAt = null;
  if (expiresInDays !== undefined) {
    const days = parseInt(expiresInDays, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({ error: 'expiresInDays must be between 1 and 365' });
    }
    expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  // user_id is null for guests, real id for logged-in users
  const userId = req.user?.id ?? null;

  try {
    // Dedup — only match links owned by the same user (or same guest scope)
    const existing = await pool.query(
      `SELECT code FROM urls
       WHERE original = $1
         AND user_id IS NOT DISTINCT FROM $2
         AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`,
      [validation.url, userId]
    );

    if (existing.rows.length > 0) {
      const code = existing.rows[0].code;
      return res.status(200).json(buildResponse(req, code, validation.url, null));
    }

    // base62 transaction
    const client = await pool.connect();
    let code;

    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO urls (code, original, expires_at, user_id)
         VALUES ('__pending__', $1, $2, $3)
         RETURNING id`,
        [validation.url, expiresAt, userId]
      );

      const id = rows[0].id;
      code = toBase62(id);

      await client.query(
        `UPDATE urls SET code = $1 WHERE id = $2`,
        [code, id]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return res.status(201).json(buildResponse(req, code, validation.url, expiresAt));

  } catch (err) {
    console.error('POST /shorten error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:code/info', async (req, res) => {
  const { code } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT code, original, created_at, expires_at
       FROM urls WHERE code = $1`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Short code not found' });
    }

    const row = rows[0];
    return res.json({
      code: row.code,
      shortUrl: `${process.env.BASE_URL}/${row.code}`,
      original: row.original,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    });

  } catch (err) {
    console.error('GET /shorten/:code/info error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ─────────────────────────────────────────────
   GET /shorten/my-links
   Private — returns all links for the logged-in user
───────────────────────────────────────────── */
router.get('/my-links', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.id,
         u.code,
         u.original,
         u.created_at,
         u.expires_at,
         COUNT(c.id) AS total_clicks
       FROM urls u
       LEFT JOIN clicks c ON c.url_id = u.id
       WHERE u.user_id = $1
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      [req.user.id]
    );

    return res.json({
      count: rows.length,
      links: rows.map(row => ({
        id:          row.id,
        code:        row.code,
        shortUrl:    `${process.env.BASE_URL}/${row.code}`,
        original:    row.original,
        createdAt:   row.created_at,
        expiresAt:   row.expires_at,
        totalClicks: parseInt(row.total_clicks, 10),
      })),
    });

  } catch (err) {
    console.error('GET /shorten/my-links error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


/* ─────────────────────────────────────────────
   DELETE /shorten/:code
   Private — only the owner can delete their link
───────────────────────────────────────────── */
router.delete('/:code', authenticate, async (req, res) => {
  const { code } = req.params;

  try {
    const { rows } = await pool.query(
      'SELECT id, user_id FROM urls WHERE code = $1',
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Short code not found' });
    }

    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this link' });
    }

    await pool.query('DELETE FROM urls WHERE code = $1', [code]);

    return res.json({ message: `Link /${code} deleted` });

  } catch (err) {
    console.error('DELETE /shorten/:code error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


function buildResponse(req, code, originalUrl, expiresAt) {
  const base = process.env.BASE_URL ?? `${req.protocol}://${req.get('host')}`;
  return {
    code,
    shortUrl: `${base}/${code}`,
    original: originalUrl,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
  };
}

/* ─────────────────────────────────────────────
   GET /shorten/:code/stats
   Returns total clicks and clicks grouped by day
   for the last 30 days.
───────────────────────────────────────────── */
router.get('/:code/stats', authenticate, async (req, res) => {
  const { code } = req.params;

  try {
    // 1. Verify the link exists and belongs to the logged-in user
    const { rows: urlRows } = await pool.query(
      `SELECT id, code, original, created_at, expires_at, user_id
       FROM urls WHERE code = $1`,
      [code]
    );

    if (urlRows.length === 0) {
      return res.status(404).json({ error: 'Short code not found' });
    }

    if (urlRows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this link' });
    }

    const urlId = urlRows[0].id;

    // 2. Total click count
    const { rows: totalRows } = await pool.query(
      `SELECT COUNT(*) AS total FROM clicks WHERE url_id = $1`,
      [urlId]
    );

    // 3. Clicks grouped by day for the last 30 days
    const { rows: dailyRows } = await pool.query(
      `SELECT
         TO_CHAR(clicked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
         COUNT(*) AS clicks
       FROM clicks
       WHERE url_id = $1
         AND clicked_at >= NOW() - INTERVAL '30 days'
       GROUP BY date
       ORDER BY date ASC`,
      [urlId]
    );

    return res.json({
      code:       urlRows[0].code,
      original:   urlRows[0].original,
      shortUrl:   `${process.env.BASE_URL}/${urlRows[0].code}`,
      createdAt:  urlRows[0].created_at,
      expiresAt:  urlRows[0].expires_at,
      totalClicks: parseInt(totalRows[0].total, 10),
      dailyClicks: dailyRows.map(row => ({
        date:   row.date,
        clicks: parseInt(row.clicks, 10),
      })),
    });

  } catch (err) {
    console.error('GET /shorten/:code/stats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;