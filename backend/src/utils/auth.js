import jwt from 'jsonwebtoken';

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? '7d';

/**
 * Signs a JWT containing the user's id, email and username.
 * Expires in 7 days by default.
 */
function signToken(user) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in .env');

  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

/**
 * Verifies a JWT and returns the decoded payload.
 * Throws if the token is invalid or expired.
 */
function verifyToken(token) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in .env');
  return jwt.verify(token, JWT_SECRET);
}

export { signToken, verifyToken };
