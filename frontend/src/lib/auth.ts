export interface AuthUser {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

const API_BASE = '/api';

export async function registerUser(
  email: string,
  username: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Registration failed');
  return data as AuthResponse;
}

export async function loginUser(
  login: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Login failed');
  return data as AuthResponse;
}

// ── Token helpers (localStorage) ──────────────────────
export function saveToken(token: string, user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('snip_token', token);
  localStorage.setItem('snip_user', JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('snip_token');
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('snip_user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('snip_token');
  localStorage.removeItem('snip_user');
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!getToken();
}