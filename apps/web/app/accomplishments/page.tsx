'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiUrl } from '../../lib/api';

export default function AccomplishmentsPage() {
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setHasToken(Boolean(token));
    if (!token) {
      setLoading(false);
      return;
    }

    updateDailyStreak();
    const storedStreak = localStorage.getItem('streakDays');
    setStreakDays(storedStreak ? Number(storedStreak) : 0);

    const fetchUser = async () => {
      try {
        const res = await fetch(apiUrl('/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const user = await res.json();
          setDisplayName(user?.name || user?.email || null);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateDailyStreak = () => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const lastActive = localStorage.getItem('lastActiveDate');
    const streakRaw = localStorage.getItem('streakDays');
    const streak = streakRaw ? Number(streakRaw) : 0;

    if (lastActive === todayKey) return;

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const nextStreak = lastActive === yesterdayKey ? streak + 1 : 1;
    localStorage.setItem('streakDays', String(nextStreak));
    localStorage.setItem('lastActiveDate', todayKey);
  };

  const content = () => {
    if (loading) return <p>Loading...</p>;
    if (!hasToken) {
      return (
        <p style={{ color: '#c9cee7' }}>
          Log in to see your streaks.{' '}
          <Link href="/login" style={{ color: '#9ef5c0', textDecoration: 'none', fontWeight: 600 }}>
            Login
          </Link>
        </p>
      );
    }

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <p style={{ margin: 0, color: '#c9cee7' }}>
          {displayName ? `${displayName}'s` : 'Your'} streak
        </p>
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 16,
            border: '1px solid rgba(158,245,192,0.3)',
            background: 'rgba(158,245,192,0.08)',
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
          }}
        >
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#9ef5c0' }}>{streakDays ?? 0}</span>
          <span style={{ color: '#f7f7fb', fontWeight: 600 }}>days</span>
        </div>
      </div>
    );
  };

  return (
    <main style={{ padding: '48px', maxWidth: 720, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ letterSpacing: 2, color: '#8ea0f6', textTransform: 'uppercase', fontSize: 12 }}>
            Accomplishments
          </p>
          <h1 style={{ margin: '8px 0 0', fontSize: '2.25rem' }}>Your streaks</h1>
        </div>
        <Link href="/" style={{ color: '#9ef5c0', textDecoration: 'none', fontWeight: 600 }}>
          Back to home
        </Link>
      </header>

      {content()}
    </main>
  );
}
