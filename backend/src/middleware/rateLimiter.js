import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Limiter for POST /shorten
 * Guests: max 10 requests per minute per IP
 * Logged-in users get a separate more generous limiter
 */
export const shortenLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute window
  max: 10,                   // max 10 requests per window
  standardHeaders: true,     // return rate limit info in headers
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if logged in, otherwise fall back to IP
    return req.user?.id?.toString() ?? ipKeyGenerator(req);
  },
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Too many requests — please wait a minute before shortening again',
    });
  },
});

/**
 * Limiter for POST /auth/register and POST /auth/login
 * Stricter — max 5 attempts per 15 minutes per IP
 * Prevents brute force attacks on passwords
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute window
  max: 5,                     // max 5 attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Too many attempts — please try again in 15 minutes',
    });
  },
});