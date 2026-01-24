'use client';

import { useParams, useRouter } from 'next/navigation';
import { StudySet } from '@nostalgic/shared';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiUrl } from '../../../lib/api';

type TermProgress = {
  termId: string;
  mcCorrect: number; // 0, 1, or 2
  writtenCorrect: boolean;
};

export default function SetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [set, setSet] = useState<StudySet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [progress, setProgress] = useState<Map<string, TermProgress>>(new Map());

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const res = await fetch(apiUrl(`/sets/${params.id}`));
        if (res.ok) {
          const data = await res.json();
          setSet(data);
          setEditTitle(data.title);
          setEditDescription(data.description);
          
          // Load progress from localStorage
          const savedProgress = localStorage.getItem(`progress-${params.id}`);
          if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            const progressMap = new Map<string, TermProgress>();
            Object.entries(progressData).forEach(([termId, prog]) => {
              progressMap.set(termId, prog as TermProgress);
            });
            setProgress(progressMap);
          }
        }
      } catch (err) {
        console.error('Failed to fetch set:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSet();
  }, [params.id]);

  const handleSave = async () => {
    if (!set) return;
    try {
      await fetch(apiUrl(`/sets/${params.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      setSet({ ...set, title: editTitle, description: editDescription });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update set:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(apiUrl(`/sets/${params.id}`), { method: 'DELETE' });
      router.push('/');
    } catch (err) {
      console.error('Failed to delete set:', err);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Loading...</div>;
  if (!set) return <div style={{ padding: '32px' }}>Set not found</div>;

  // Calculate progress statistics
  const mastered = set.terms.filter(term => {
    const p = progress.get(term.id);
    return p && p.mcCorrect === 2 && p.writtenCorrect;
  }).length;

  const partial = set.terms.filter(term => {
    const p = progress.get(term.id);
    return p && (p.mcCorrect > 0 || p.writtenCorrect) && !(p.mcCorrect === 2 && p.writtenCorrect);
  }).length;

  const notStarted = set.terms.length - mastered - partial;
  // Mastered = 100%, Learning = 50%, Not started = 0%
  const progressScore = mastered * 1.0 + partial * 0.5;
  const overallProgress = Math.round((progressScore / set.terms.length) * 100);

  return (
    <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      <Link href="/" style={{ fontWeight: 600, marginBottom: '32px', display: 'block' }}>
        ← Back to Sets
      </Link>

      {isEditing ? (
        <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{ padding: '12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#f7f7fb', fontSize: '1.5rem', fontWeight: 700 }}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            style={{ padding: '12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#c9cee7', fontSize: '1rem', minHeight: 80 }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSave} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(145deg, #9ef5c0, #8dd9ac)', color: '#1a1d2d', cursor: 'pointer', fontWeight: 700 }}>
              Save
            </button>
            <button onClick={() => setIsEditing(false)} style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#f7f7fb', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>{set.title}</h1>
              <p style={{ color: '#c9cee7', fontSize: '1.1rem' }}>{set.description}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#f7f7fb', cursor: 'pointer', fontSize: '0.9rem' }}>
                Edit
              </button>
              <button onClick={handleDelete} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div style={{ marginBottom: 32, padding: '24px', borderRadius: 16, background: 'linear-gradient(145deg, rgba(142,160,246,0.1), rgba(158,245,192,0.1))', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ marginBottom: 16, fontSize: '1.3rem' }}>Your Progress</h2>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: '100%', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 8 }}>
            <div 
              style={{ 
                width: `${overallProgress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #9ef5c0, #8dd9ac)',
                transition: 'width 0.3s ease-out'
              }} 
            />
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#c9cee7', textAlign: 'right' }}>
            {overallProgress}% Complete
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(158,245,192,0.15)', border: '1px solid rgba(158,245,192,0.3)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#c9cee7', marginBottom: 8 }}>Mastered</p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#9ef5c0' }}>{mastered}</p>
          </div>
          <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(142,160,246,0.15)', border: '1px solid rgba(142,160,246,0.3)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#c9cee7', marginBottom: 8 }}>Learning</p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#8ea0f6' }}>{partial}</p>
          </div>
          <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#c9cee7', marginBottom: 8 }}>Not Started</p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#f7f7fb' }}>{notStarted}</p>
          </div>
        </div>
      </div>

      {/* All Terms */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>All Terms ({set.terms.length})</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {set.terms.map((term) => {
            const termProg = progress.get(term.id);
            const isMastered = termProg && termProg.mcCorrect === 2 && termProg.writtenCorrect;
            const isLearning = termProg && (termProg.mcCorrect > 0 || termProg.writtenCorrect) && !isMastered;
            
            let borderColor = 'rgba(255,255,255,0.12)';
            let bgColor = 'rgba(255,255,255,0.04)';
            let statusEmoji = '⚪';
            
            if (isMastered) {
              borderColor = 'rgba(158,245,192,0.3)';
              bgColor = 'rgba(158,245,192,0.1)';
              statusEmoji = '✅';
            } else if (isLearning) {
              borderColor = 'rgba(142,160,246,0.3)';
              bgColor = 'rgba(142,160,246,0.1)';
              statusEmoji = '🔄';
            }
            
            return (
              <div
                key={term.id}
                style={{
                  padding: '16px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  background: bgColor,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 16,
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{statusEmoji}</span>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{term.term}</p>
                  <p style={{ margin: 0, color: '#c9cee7', fontSize: '0.9rem' }}>{term.definition}</p>
                </div>
                {termProg && (
                  <div style={{ fontSize: '0.85rem', color: '#c9cee7', textAlign: 'right' }}>
                    <div>MC: {termProg.mcCorrect}/2</div>
                    <div>Written: {termProg.writtenCorrect ? '✓' : '✗'}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Study Modes</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <Link
            href={`/sets/${params.id}/learn`}
            style={{
              padding: '16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              textDecoration: 'none',
              color: '#f7f7fb',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            Learn 📚
          </Link>
          <Link
            href={`/sets/${params.id}/flashcards`}
            style={{
              padding: '16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              textDecoration: 'none',
              color: '#f7f7fb',
              fontWeight: 600
            }}
          >
            Flashcards 🎴
          </Link>
          <Link
            href={`/sets/${params.id}/test`}
            style={{
              padding: '16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              textDecoration: 'none',
              color: '#f7f7fb',
              fontWeight: 600
            }}
          >
            Test 📝
          </Link>
        </div>
      </div>
    </main>
  );
}
