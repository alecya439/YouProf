'use client';

import Link from 'next/link';
import { StudySet } from '@nostalgic/shared';
import { useEffect, useState } from 'react';
import { apiUrl } from '../lib/api';

const cardStyle =
  'background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);';

export default function HomePage() {
  const [sets, setSets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsAuthenticated(false);
      setUserName(null);
      setUserEmail(null);
      setStreakDays(null);
      setLoading(false);
      return;
    }

    validateSession(token);
  }, []);

  const validateSession = async (token: string) => {
    try {
      const res = await fetch(apiUrl('/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUserName(null);
        setUserEmail(null);
        setStreakDays(null);
        return;
      }

      const user = await res.json();
      setUserName(user?.name ?? null);
      setUserEmail(user?.email ?? null);
      setIsAuthenticated(true);
      const nextStreak = updateDailyStreak();
      setStreakDays(nextStreak);
      await fetchSets(token);
    } catch (err) {
      console.error('Failed to validate session:', err);
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUserName(null);
      setUserEmail(null);
      setStreakDays(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSets = async (token?: string) => {
    try {
      console.log('Fetching sets from', apiUrl('/sets'));
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(apiUrl('/sets'), { headers });
      console.log('Response status:', res.status, res.ok);
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched sets:', data);
        setSets(data);
      } else {
        console.error('Response not OK:', res.status, res.statusText);
        // If unauthorized, clear token
        if (res.status === 401) {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        } else {
          setError(`Failed to load sets: ${res.status}`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sets:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsAuthenticated(false);
      setUserName(null);
      setUserEmail(null);
      setStreakDays(null);
    }
  };

  const updateDailyStreak = () => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const lastActive = localStorage.getItem('lastActiveDate');
    const streakRaw = localStorage.getItem('streakDays');
    const streak = streakRaw ? Number(streakRaw) : 0;

    if (lastActive === todayKey) return streak;

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const nextStreak = lastActive === yesterdayKey ? streak + 1 : 1;
    localStorage.setItem('streakDays', String(nextStreak));
    localStorage.setItem('lastActiveDate', todayKey);
    return nextStreak;
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this set?')) return;
    
    try {
      const res = await fetch(apiUrl(`/sets/${id}`), { method: 'DELETE' });
      if (res.ok) {
        setSets(sets.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Error deleting set');
    }
  };

  const displayName = userName || userEmail;

  return (
    <main style={{ padding: '48px', display: 'grid', gap: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 24 }}>
        <div>
          <p style={{ letterSpacing: 2, color: '#8ea0f6', textTransform: 'uppercase', fontSize: 12 }}>
            Nostalgic
          </p>
          <h1 style={{ margin: '8px 0 16px', fontSize: '2.75rem', lineHeight: 1.1 }}>Study that feels playful</h1>
          <p style={{ maxWidth: 640, color: '#c9cee7' }}>
            Create study sets, flip through flashcards, and quiz yourself with adaptive drills. Web and mobile stay in
            sync.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  style={{ padding: '12px 18px', background: '#9ef5c0', color: '#0b1021', borderRadius: 999, fontWeight: 700, textDecoration: 'none' }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  style={{ padding: '12px 18px', border: '1px solid rgba(158,245,192,0.3)', background: 'transparent', color: '#9ef5c0', borderRadius: 999, fontWeight: 700, textDecoration: 'none' }}
                >
                  Register
                </Link>
              </>
            ) : (
              <Link
                href="/create"
                style={{ padding: '12px 18px', background: '#9ef5c0', color: '#0b1021', borderRadius: 999, fontWeight: 700, textDecoration: 'none' }}
              >
                Create a set
              </Link>
            )}
          </div>
        </div>
        {isAuthenticated && displayName && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 999,
              border: '1px solid rgba(142,160,246,0.4)',
              background: 'rgba(142,160,246,0.12)',
              color: '#f7f7fb',
              fontWeight: 600,
              fontSize: 14,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>{displayName}</span>
            {typeof streakDays === 'number' && (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(158,245,192,0.2)',
                  color: '#9ef5c0',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {streakDays} day streak
              </span>
            )}
          </div>
        )}
      </header>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {[
          { title: 'Flashcards', desc: 'Swipe or click to reveal answers; mark known/unknown.' },
          { title: 'Learn & Test', desc: 'Multiple choice and type-to-answer drills to reinforce memory.' },
          { title: 'Progress', desc: 'Per-set stats for known terms and session streaks.' }
        ].map((item) => (
          <div key={item.title} style={{ ...parseStyle(cardStyle) }}>
            <h3 style={{ margin: '0 0 8px' }}>{item.title}</h3>
            <p style={{ margin: 0, color: '#c9cee7' }}>{item.desc}</p>
          </div>
        ))}
      </section>

      {!isAuthenticated ? (
        <section style={{ textAlign: 'center', padding: '40px 24px', borderRadius: 16, background: 'rgba(142,160,246,0.1)', border: '1px solid rgba(142,160,246,0.3)' }}>
          <h2 style={{ marginBottom: 16 }}>Ready to start learning?</h2>
          <p style={{ color: '#c9cee7', marginBottom: 24 }}>Sign up to create your study sets and track your progress.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link
              href="/login"
              style={{ padding: '12px 24px', background: '#9ef5c0', color: '#0b1021', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}
            >
              Login
            </Link>
            <Link
              href="/register"
              style={{ padding: '12px 24px', border: '1px solid rgba(158,245,192,0.3)', background: 'transparent', color: '#9ef5c0', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}
            >
              Register
            </Link>
          </div>
        </section>
      ) : (
        <section style={{ display: 'grid', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Your study sets</h2>
          {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
          {loading ? (
            <p>Loading...</p>
          ) : sets.length === 0 ? (
            <p style={{ color: '#c9cee7' }}>No sets yet. Create one to get started!</p>
        ) : (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {sets.map((set) => (
              <div key={set.id} style={{ position: 'relative' }}>
                <Link
                  href={`/sets/${set.id}`}
                  style={{ ...parseStyle(cardStyle), cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#8ea0f6', marginBottom: 8 }}>
                    {set.visibility} · {set.terms.length} terms
                  </div>
                  <h3 style={{ margin: '0 0 8px' }}>{set.title}</h3>
                  {set.description && <p style={{ margin: 0, color: '#c9cee7', fontSize: 14 }}>{set.description}</p>}
                </Link>
                <button
                  onClick={(e) => handleDelete(set.id, e)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(255,50,50,0.15)',
                    border: '1px solid rgba(255,100,100,0.3)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        </section>
      )}
    </main>
  );
}

function parseStyle(style: string) {
  return style.split(';').reduce<Record<string, string>>((acc, rule) => {
    const [prop, value] = rule.split(':');
    if (prop && value) {
      const key = prop.trim().replace(/-([a-z])/g, (_, c) => (c ? c.toUpperCase() : ''));
      acc[key] = value.trim();
    }
    return acc;
  }, {});
}
