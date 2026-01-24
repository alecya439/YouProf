'use client';

import { StudyTerm } from '@nostalgic/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiUrl } from '../../lib/api';

const emptyTerm = { id: `tmp-${Math.random()}`, term: '', definition: '' } as StudyTerm;

export default function CreateSetPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState<StudyTerm[]>([emptyTerm]);
  const [loading, setLoading] = useState(false);

  const handleAddTerm = () => {
    setTerms([...terms, { id: `tmp-${Math.random()}`, term: '', definition: '' }]);
  };

  const handleTermChange = (index: number, field: 'term' | 'definition', value: string) => {
    const updated = [...terms];
    updated[index] = { ...updated[index], [field]: value };
    setTerms(updated);
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleSave = async (isPublic: boolean) => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (terms.some((t) => !t.term.trim() || !t.definition.trim())) {
      alert('All terms must have a term and definition');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description: description.trim() || undefined,
        terms: terms.map(({ id: _, ...t }) => t),
        visibility: isPublic ? 'public' : 'private',
        id: `set-${Date.now()}`
      };
      console.log('Sending payload:', payload);
      
      const res = await fetch(apiUrl('/sets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', res.status);
      const text = await res.text();
      console.log('Response text:', text);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      
      const saved = JSON.parse(text);
      console.log('Saved set:', saved);
      router.push(`/sets/${saved.id}`);
    } catch (err) {
      console.error('Save error:', err);
      alert(`Error saving set: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto', display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ fontWeight: 600 }}>
          ← Back
        </Link>
        <h1 style={{ margin: 0 }}>Create a study set</h1>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Title</span>
          <input
            style={inputStyle}
            placeholder="Biology — Cell structure"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Description</span>
          <textarea
            style={{ ...inputStyle, minHeight: 80 }}
            placeholder="Optional context"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </div>
      <section style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Terms</h3>
          <button style={pillButton} onClick={handleAddTerm}>
            + Add term
          </button>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {terms.map((term, idx) => (
            <div key={term.id} style={termRowStyle}>
              <input
                style={inputStyle}
                placeholder="Term"
                value={term.term}
                onChange={(e) => handleTermChange(idx, 'term', e.target.value)}
              />
              <input
                style={inputStyle}
                placeholder="Definition"
                value={term.definition}
                onChange={(e) => handleTermChange(idx, 'definition', e.target.value)}
              />
              {terms.length > 1 && (
                <button style={ghostButton} onClick={() => handleRemoveTerm(idx)}>
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button style={ghostButton} onClick={() => handleSave(false)} disabled={loading}>
          Save draft
        </button>
        <button
          style={{ ...pillButton, background: '#9ef5c0', color: '#0b1021' }}
          onClick={() => handleSave(true)}
          disabled={loading}
        >
          {loading ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  color: '#f7f7fb'
};

const pillButton: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.08)',
  color: '#f7f7fb',
  cursor: 'pointer'
};

const ghostButton: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  color: '#f7f7fb',
  cursor: 'pointer'
};

const termRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr auto',
  gap: 12,
  alignItems: 'center'
};
