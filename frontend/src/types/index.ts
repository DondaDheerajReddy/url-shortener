export interface ShortenResponse {
  code: string;
  shortUrl: string;
  original: string;
  expiresAt: string | null;
}

export interface ShortenError {
  error: string;
}
