'use client';

import { useParams } from 'next/navigation';
import { StudySet } from '@nostalgic/shared';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiUrl } from '../../../../lib/api';

export default function FlashcardsPage() {
  const params = useParams();
  const [set, setSet] = useState<StudySet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState<StudySet['terms']>([]);

  useEffect(() => {
    const fetchSet = async () => {
      const res = await fetch(apiUrl(`/sets/${params.id}`));
      if (res.ok) {
        const data = await res.json();
        setSet(data);
        setShuffled([...data.terms].sort(() => Math.random() - 0.5));
      }
    };
    fetchSet();
  }, [params.id]);

  const current = shuffled[currentIndex];

  const goNext = () => {
    if (currentIndex < shuffled.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (!current) return <div style={{ padding: '32px' }}>Loading...</div>;

  return (
    <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto', minHeight: '100vh', display: 'grid', gap: 24, gridTemplateRows: 'auto 1fr auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/sets/${params.id}`} style={{ fontWeight: 600 }}>← Back</Link>
        <span style={{ color: '#c9cee7' }}>{currentIndex + 1} / {shuffled.length}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            width: '100%',
            maxWidth: 500,
            aspectRatio: '3/2',
            perspective: '1000px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transition: 'transform 0.6s',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '32px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(142,160,246,0.2), rgba(158,245,192,0.2))',
                border: '2px solid rgba(142,160,246,0.5)',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#8ea0f6', textTransform: 'uppercase' }}>Term</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>{current.term}</p>
              <p style={{ margin: '16px 0 0', fontSize: '0.8rem', color: '#c9cee7' }}>Click to reveal definition</p>
            </div>

            {/* Back */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '32px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(158,245,192,0.2), rgba(142,160,246,0.2))',
                border: '2px solid rgba(158,245,192,0.5)',
                textAlign: 'center',
                transform: 'rotateY(180deg)',
              }}
            >
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#9ef5c0', textTransform: 'uppercase' }}>Definition</p>
              <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 500 }}>{current.definition}</p>
              <p style={{ margin: '16px 0 0', fontSize: '0.8rem', color: '#c9cee7' }}>Click to see term</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={goPrev} disabled={currentIndex === 0} style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#f7f7fb', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.5 : 1 }}>
          ← Previous
        </button>
        <button onClick={goNext} disabled={currentIndex === shuffled.length - 1} style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#f7f7fb', cursor: currentIndex === shuffled.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex === shuffled.length - 1 ? 0.5 : 1 }}>
          Next →
        </button>
      </div>
    </main>
  );
}
