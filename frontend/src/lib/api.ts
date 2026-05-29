import type { ShortenResponse } from '@/types';
import { getToken } from '@/lib/auth';

const API_BASE = '/api';

export async function shortenUrl(
  url: string,
  expiresInDays?: number
): Promise<ShortenResponse> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach token if user is logged in
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/shorten`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url, ...(expiresInDays && { expiresInDays }) }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Something went wrong');
  }

  return data as ShortenResponse;
}