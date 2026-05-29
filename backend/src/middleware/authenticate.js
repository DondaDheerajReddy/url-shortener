import { verifyToken } from '../utils/auth.js';

/**
 * authenticate — required auth middleware
 * Rejects requests with no valid Bearer token.
 * Use on routes that MUST be logged in.
 *
 * Usage: router.get('/my-links', authenticate, handler)
 */
function authenticate(req, res, next) {
  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.split(' ')[1];

  try {
    req.user = verifyToken(token);  // attaches { id, email, username } to req
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired — please log in again' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * optionalAuth — soft auth middleware
 * Sets req.user if a valid token is present, otherwise req.user = null.
 * Use on routes that work for both guests AND logged-in users.
 *
 * Usage: router.post('/', optionalAuth, handler)
 */
function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = header.split(' ')[1];

  try {
    req.user = verifyToken(token);
  } catch {
    req.user = null;
  }

  next();
}

export { authenticate, optionalAuth };
