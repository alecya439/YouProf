'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiUrl, parseApiError } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }

      const { token, user } = await res.json();
      localStorage.setItem('authToken', token);
      if (user) {
        localStorage.setItem('authUser', JSON.stringify(user));
      }
      router.push('/');
    } catch (err) {
      const message = err instanceof Error && err.message
        ? err.message
        : 'An error occurred. Please try again.';
      setError(message === 'Failed to fetch'
        ? 'Unable to reach the API. Make sure the API server is running.'
        : message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '32px', maxWidth: 400, margin: '100px auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>
        Create Account
      </h1>

      <form onSubmit={handleRegister} style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            placeholder="Your name"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#f7f7fb',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#f7f7fb',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#f7f7fb',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(255,107,107,0.15)', padding: 12, borderRadius: 8, color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(145deg, #9ef5c0, #8dd9ac)',
            color: loading ? '#999' : '#1a1d2d',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#c9cee7', marginBottom: 16 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#9ef5c0', textDecoration: 'none', fontWeight: 600 }}>
          Login here
        </Link>
      </p>

      <Link href="/" style={{ display: 'block', textAlign: 'center', color: '#8ea0f6', textDecoration: 'none' }}>
        ← Back to home
      </Link>
    </main>
  );
}
