'use client';

import { useEffect, useState } from 'react';
import { apiUrl } from '../../lib/api';

type UserResponse = {
  name?: string | null;
  email?: string | null;
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getYesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const computeDayStreak = () => {
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  const lastDate = localStorage.getItem('lastStreakDate');
  const stored = Number(localStorage.getItem('dayStreak') || '0');

  let nextStreak = 1;

  if (lastDate === today) {
    nextStreak = stored || 1;
  } else if (lastDate === yesterday) {
    nextStreak = (stored || 0) + 1;
  }

  localStorage.setItem('dayStreak', String(nextStreak));
  localStorage.setItem('lastStreakDate', today);

  return nextStreak;
};

export default function UserBadge() {
  const [username, setUsername] = useState('Guest');
  const [email, setEmail] = useState<string | null>(null);
  const [dayStreak, setDayStreak] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as UserResponse;
        setUsername(user.name || user.email || 'User');
        setEmail(user.email ?? null);
      } catch {
        // ignore parse errors
      }
    }
    setDayStreak(computeDayStreak());

    if (!token) return;

    fetch(apiUrl('/auth/me'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as UserResponse;
      })
      .then((user) => {
        if (!user) return;
        setUsername(user.name || user.email || 'User');
        setEmail(user.email ?? null);
        localStorage.setItem('authUser', JSON.stringify(user));
      })
      .catch(() => {
        setUsername('User');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUsername('Guest');
    setEmail(null);
    setMenuOpen(false);
    setProfileOpen(false);
    window.location.href = '/';
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 12px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 14,
          color: '#c9cee7',
          cursor: 'pointer'
        }}
      >
        <span style={{ color: '#f7f7fb', fontWeight: 600 }}>{username}</span>
        <span style={{ opacity: 0.7 }}>•</span>
        <span>Day streak: {dayStreak} 🔥</span>
      </button>

      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 8,
            minWidth: 140,
            background: 'rgba(16,20,36,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            overflow: 'hidden'
          }}
        >
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              color: '#f7f7fb',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              color: '#f7f7fb',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            Log out
          </button>
        </div>
      )}

      {profileOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: menuOpen ? 54 : 8,
            minWidth: 220,
            padding: 12,
            background: 'rgba(16,20,36,0.98)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
          }}
        >
          <div style={{ fontSize: 12, color: '#c9cee7', marginBottom: 6 }}>Email</div>
          <div style={{ fontSize: 14, color: '#f7f7fb', marginBottom: 10 }}>
            {email ?? '—'}
          </div>
          <div style={{ fontSize: 12, color: '#c9cee7', marginBottom: 6 }}>Password</div>
          <div style={{ fontSize: 14, color: '#f7f7fb' }}>Hidden for security</div>
        </div>
      )}
    </div>
  );
}
