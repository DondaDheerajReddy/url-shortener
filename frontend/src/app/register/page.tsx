'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { registerUser, saveToken } from '@/lib/auth';

const FIELDS = [
  {
    name: 'email',
    label: 'Email address',
    type: 'email' as const,
    placeholder: 'you@example.com',
    autoComplete: 'email',
  },
  {
    name: 'username',
    label: 'Username',
    type: 'text' as const,
    placeholder: 'cooluser123',
    autoComplete: 'username',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'At least 8 characters',
    autoComplete: 'new-password',
  },
];

export default function RegisterPage() {
  const router = useRouter();

  async function handleRegister(values: Record<string, string>) {
    const { email, username, password } = values;

    // Client-side validation before hitting the API
    if (!email.trim() || !username.trim() || !password.trim()) {
      throw new Error('Please fill in all fields');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      throw new Error('Username must be 3–30 characters, letters/numbers/underscores only');
    }

    const data = await registerUser(email.trim(), username.trim(), password);

    // Save JWT and user to localStorage
    saveToken(data.token, data.user);

    // Redirect to dashboard
    router.push('/dashboard');
  }

  return (
    <AuthForm
      title="Create your account"
      subtitle="Start shortening and tracking your links for free."
      fields={FIELDS}
      submitLabel="Create account"
      loadingLabel="Creating account..."
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerLinkHref="/login"
      onSubmit={handleRegister}
    />
  );
}