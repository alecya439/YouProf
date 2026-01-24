'use client';

import { useParams } from 'next/navigation';
import { StudySet, StudyTerm } from '@nostalgic/shared';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiUrl } from '../../../../lib/api';

export default function TestPage() {
  const params = useParams();
  const [set, setSet] = useState<StudySet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchSet = async () => {
      const res = await fetch(apiUrl(`/sets/${params.id}`));
      if (res.ok) {
        const data = await res.json();
        setSet(data);
      }
    };
    fetchSet();
  }, [params.id]);

  if (!set) return <div style={{ padding: '32px' }}>Loading...</div>;

  const current = set.terms[currentIndex];
  const isAnswered = answers[current.id] !== undefined;
  const allAnswered = set.terms.every(t => answers[t.id] !== undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({
      ...answers,
      [current.id]: e.target.value,
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    set.terms.forEach(term => {
      const userAnswer = answers[term.id] || '';
      if (userAnswer.toLowerCase() === term.definition.toLowerCase()) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto', minHeight: '100vh', display: 'grid', gap: 24, placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 24px' }}>Test Complete!</h1>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: '#9ef5c0', marginBottom: 32 }}>
            {score}/{set.terms.length}
          </div>
          <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
            {set.terms.map(term => {
              const userAnswer = answers[term.id] || '';
              const isCorrect = userAnswer.toLowerCase() === term.definition.toLowerCase();
              return (
                <div key={term.id} style={{ padding: '16px', borderRadius: 12, background: isCorrect ? 'rgba(158,245,192,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${isCorrect ? 'rgba(158,245,192,0.3)' : 'rgba(255,107,107,0.3)'}`, textAlign: 'left' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{term.term}</p>
                  <p style={{ margin: '0 0 8px', color: '#c9cee7', fontSize: '0.9rem' }}>Your answer: {userAnswer || '(empty)'}</p>
                  <p style={{ margin: 0, color: isCorrect ? '#9ef5c0' : '#ff6b6b', fontSize: '0.9rem' }}>
                    {isCorrect ? '✓ Correct' : `✗ Expected: ${term.definition}`}
                  </p>
                </div>
              );
            })}
          </div>
          <Link href={`/sets/${params.id}`} style={{ padding: '12px 24px', borderRadius: 8, background: '#8ea0f6', color: '#1a1d2d', fontWeight: 600, textDecoration: 'none' }}>
            Back to Set
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto', minHeight: '100vh', display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/sets/${params.id}`} style={{ fontWeight: 600 }}>← Back</Link>
        <span style={{ color: '#c9cee7' }}>{currentIndex + 1} / {set.terms.length}</span>
      </div>

      <div style={{ padding: '24px', borderRadius: 12, background: 'rgba(142,160,246,0.1)', border: '1px solid rgba(142,160,246,0.3)' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#8ea0f6', textTransform: 'uppercase' }}>Define</p>
        <p style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{current.term}</p>
      </div>

      <input
        type="text"
        value={answers[current.id] || ''}
        onChange={handleInputChange}
        placeholder="Type the definition..."
        style={{
          padding: '16px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.04)',
          color: '#f7f7fb',
          fontSize: '1rem',
          fontFamily: 'inherit',
        }}
      />

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            color: '#f7f7fb',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          ← Previous
        </button>
        <button
          onClick={() => currentIndex < set.terms.length - 1 && setCurrentIndex(currentIndex + 1)}
          disabled={currentIndex === set.terms.length - 1}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            color: '#f7f7fb',
            cursor: currentIndex === set.terms.length - 1 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === set.terms.length - 1 ? 0.5 : 1,
          }}
        >
          Next →
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAnswered}
        style={{
          padding: '14px 32px',
          borderRadius: 8,
          border: 'none',
          background: allAnswered ? 'linear-gradient(145deg, #9ef5c0, #8dd9ac)' : 'rgba(158,245,192,0.3)',
          color: '#1a1d2d',
          cursor: allAnswered ? 'pointer' : 'not-allowed',
          fontWeight: 700,
          fontSize: '1rem',
        }}
      >
        Submit Test
      </button>
    </main>
  );
}
