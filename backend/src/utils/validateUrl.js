import validUrl from "valid-url";

/**
 * Validates and normalises a URL string.
 *
 * Returns { ok: true, url } on success.
 * Returns { ok: false, error } on failure.
 */
function validateUrl(input) {
  if (!input || typeof input !== 'string') {
    return { ok: false, error: 'URL is required' };
  }

  const trimmed = input.trim();

  // Auto-prepend https:// if the user forgot the scheme
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  if (!validUrl.isWebUri(withScheme)) {
    return { ok: false, error: 'Invalid URL — must be a valid http/https address' };
  }

  // Block localhost / private IPs to prevent SSRF
  const { hostname } = new URL(withScheme);
  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (blocked.includes(hostname)) {
    return { ok: false, error: 'URL points to a private address' };
  }

  return { ok: true, url: withScheme };
}

export default validateUrl;
