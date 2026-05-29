'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { loginUser, saveToken } from '@/lib/auth';

const FIELDS = [
  {
    name: 'login',
    label: 'Email or username',
    type: 'text' as const,
    placeholder: 'you@example.com or username',
    autoComplete: 'username',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: '••••••••',
    autoComplete: 'current-password',
  },
];

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(values: Record<string, string>) {
    const { login, password } = values;

    // Basic client-side check
    if (!login.trim() || !password.trim()) {
      throw new Error('Please fill in all fields');
    }

    const data = await loginUser(login.trim(), password);

    // Save JWT and user to localStorage
    saveToken(data.token, data.user);

    // Redirect to dashboard
    router.push('/dashboard');
  }

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Log in to manage and track your links."
      fields={FIELDS}
      submitLabel="Log in"
      loadingLabel="Logging in..."
      footerText="Don't have an account?"
      footerLinkLabel="Sign up for free"
      footerLinkHref="/register"
      onSubmit={handleLogin}
    />
  );
}