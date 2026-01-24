'use client';

import { useParams, useRouter } from 'next/navigation';
import { StudySet, StudyTerm } from '@nostalgic/shared';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiUrl } from '../../../../lib/api';

type Question = {
  termId: string;
  type: 'mc-def-to-term' | 'mc-term-to-def' | 'written';
  term: StudyTerm;
};

type TermProgress = {
  termId: string;
  mcCorrect: number;
  writtenCorrect: boolean;
};

const MAX_QUESTIONS_PER_SESSION = 20;

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const [set, setSet] = useState<StudySet | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mistakeTermIds, setMistakeTermIds] = useState<Set<string>>(new Set());
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [completedMCByTerm, setCompletedMCByTerm] = useState<Map<string, Set<string>>>(new Map());
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [sessionProgress, setSessionProgress] = useState<Map<string, TermProgress>>(new Map());

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const res = await fetch(apiUrl(`/sets/${params.id}`));
        if (res.ok) {
          const data = await res.json();
          setSet(data);
          
          const savedProgress = localStorage.getItem(`progress-${params.id}`);
          const existingProgress = new Map<string, TermProgress>();
          
          if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            Object.entries(progressData).forEach(([termId, prog]) => {
              existingProgress.set(termId, prog as TermProgress);
            });
          }
          
          generateQuestions(data, existingProgress);
        }
      } catch (err) {
        console.error('Failed to fetch set:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSet();
  }, [params.id]);

  const generateQuestions = (studySet: StudySet, existingProgress: Map<string, TermProgress>) => {
    const allQuestions: Question[] = [];
    
    const termsToStudy = studySet.terms.filter(term => {
      const prog = existingProgress.get(term.id);
      return !prog || prog.mcCorrect < 2 || !prog.writtenCorrect;
    });
    
    const maxTermsPerSession = Math.ceil(MAX_QUESTIONS_PER_SESSION / 2);
    const sessionTerms = termsToStudy.slice(0, maxTermsPerSession);
    
    sessionTerms.forEach((term) => {
      const prog = existingProgress.get(term.id);
      const mcCorrect = prog?.mcCorrect || 0;
      
      if (mcCorrect < 2) {
        allQuestions.push({
          termId: term.id,
          type: 'mc-def-to-term',
          term
        });
        allQuestions.push({
          termId: term.id,
          type: 'mc-term-to-def',
          term
        });
      }
    });

    const sessionProg = new Map<string, TermProgress>();
    sessionTerms.forEach(term => {
      const existing = existingProgress.get(term.id);
      sessionProg.set(term.id, existing || { termId: term.id, mcCorrect: 0, writtenCorrect: false });
    });
    setSessionProgress(sessionProg);

    const shuffled = shuffleAvoidingConsecutive(allQuestions);
    const limitedQuestions = shuffled.slice(0, MAX_QUESTIONS_PER_SESSION);
    setQuestions(limitedQuestions);
    setTotalQuestions(sessionTerms.length * 3);
    setCompletedMCByTerm(new Map());
  };

  const shuffleAvoidingConsecutive = (questions: Question[]): Question[] => {
    const result: Question[] = [];
    const remaining = [...questions];
    
    while (remaining.length > 0) {
      let attempts = 0;
      let foundValid = false;
      
      while (attempts < remaining.length && !foundValid) {
        const randomIndex = Math.floor(Math.random() * remaining.length);
        const candidate = remaining[randomIndex];
        
        if (result.length === 0 || result[result.length - 1].termId !== candidate.termId) {
          result.push(candidate);
          remaining.splice(randomIndex, 1);
          foundValid = true;
        }
        attempts++;
      }
      
      if (!foundValid && remaining.length > 0) {
        result.push(remaining[0]);
        remaining.splice(0, 1);
      }
    }
    
    return result;
  };

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.type.startsWith('mc')) {
        generateMCOptions(currentQuestion);
      }
    }
  }, [currentQuestionIndex, questions]);

  const generateMCOptions = (question: Question) => {
    if (!set) return;
    
    const correctAnswer = question.type === 'mc-term-to-def' 
      ? question.term.definition 
      : question.term.term;
    
    const allOptions = question.type === 'mc-term-to-def'
      ? set.terms.map(t => t.definition)
      : set.terms.map(t => t.term);
    
    const wrongOptions = allOptions.filter(opt => opt !== correctAnswer);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    
    const mcOptions = [...shuffledWrong, correctAnswer].sort(() => Math.random() - 0.5);
    setOptions(mcOptions);
  };

  const saveProgress = (termId: string, termProg: TermProgress) => {
    sessionProgress.set(termId, termProg);
    setSessionProgress(new Map(sessionProgress));
    
    const allProgress = localStorage.getItem(`progress-${params.id}`);
    const progressMap = allProgress ? JSON.parse(allProgress) : {};
    progressMap[termId] = termProg;
    localStorage.setItem(`progress-${params.id}`, JSON.stringify(progressMap));
  };

  if (loading) {
    return (
      <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!set) {
    return (
      <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
        <p>Set not found</p>
      </main>
    );
  }

  const accuracy = answeredCount > 0 ? Math.round(((answeredCount / (answeredCount + mistakeTermIds.size)) * 100)) : 100;

  if (currentQuestionIndex >= questions.length) {
    return (
      <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16, background: 'linear-gradient(145deg, #9ef5c0, #8dd9ac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Session Complete! 🎉
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#c9cee7', marginBottom: 32 }}>Great job! You've completed this learning session.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(158,245,192,0.15)', border: '1px solid rgba(158,245,192,0.3)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#c9cee7', marginBottom: 8 }}>Accuracy</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#9ef5c0' }}>{accuracy}%</p>
            </div>
            <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(142,160,246,0.15)', border: '1px solid rgba(142,160,246,0.3)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#c9cee7', marginBottom: 8 }}>Points</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#8ea0f6' }}>{points}</p>
            </div>
            <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#c9cee7', marginBottom: 8 }}>Best Streak</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#ff6b6b' }}>{maxStreak}</p>
            </div>
          </div>
          {mistakeTermIds.size > 0 && (
            <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#ff6b6b' }}>Terms to Review ({mistakeTermIds.size})</p>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#c9cee7', fontSize: '0.9rem' }}>
                {Array.from(mistakeTermIds).map(termId => {
                  const term = set.terms.find(t => t.id === termId);
                  return term ? <li key={termId}>{term.term}</li> : null;
                })}
              </ul>
            </div>
          )}
          <button 
            onClick={() => router.push(`/sets/${params.id}`)} 
            style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(145deg, #9ef5c0, #8dd9ac)', color: '#1a1d2d', cursor: 'pointer', fontWeight: 700 }}
          >
            Back to Set
          </button>
        </div>
      </main>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleSelectMCAnswer = (answer: string) => {
    if (isCorrect !== null) return;
    setSelectedAnswer(answer);
    
    const correctAnswer = currentQuestion.type === 'mc-term-to-def' 
      ? currentQuestion.term.definition 
      : currentQuestion.term.term;
    
    const correct = answer === correctAnswer;
    setIsCorrect(correct);
    
    if (!correct) {
      setMistakeTermIds(new Set([...mistakeTermIds, currentQuestion.term.id]));
      setStreak(0);
      
      const insertPosition = Math.min(
        currentQuestionIndex + 5 + Math.floor(Math.random() * 3),
        questions.length
      );
      const updatedQuestions = [...questions];
      updatedQuestions.splice(insertPosition, 0, currentQuestion);
      setQuestions(updatedQuestions);
    } else {
      const questionKey = `${currentQuestion.term.id}-${currentQuestion.type}`;
      if (!completedQuestions.has(questionKey)) {
        setAnsweredCount(answeredCount + 1);
        setCompletedQuestions(new Set([...completedQuestions, questionKey]));
      }
      
      setPoints(points + 10);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      
      const termId = currentQuestion.term.id;
      const completed = completedMCByTerm.get(termId) || new Set<string>();
      completed.add(currentQuestion.type);
      
      const termProg = sessionProgress.get(termId) || { termId, mcCorrect: 0, writtenCorrect: false };
      termProg.mcCorrect = completed.size;
      saveProgress(termId, termProg);
      
      if (completed.size === 2) {
        const insertPosition = Math.min(
          currentQuestionIndex + 3 + Math.floor(Math.random() * 3),
          questions.length
        );
        const writtenQuestion: Question = {
          termId: currentQuestion.term.id,
          type: 'written',
          term: currentQuestion.term
        };
        const updatedQuestions = [...questions];
        updatedQuestions.splice(insertPosition, 0, writtenQuestion);
        setQuestions(updatedQuestions);
      }
      
      const newCompleted = new Map(completedMCByTerm);
      newCompleted.set(termId, completed);
      setCompletedMCByTerm(newCompleted);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setUserInput('');
    setIsSubmitted(false);
  };

  const handleSubmitWrite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    const correct = userInput.trim().toLowerCase() === currentQuestion.term.definition.trim().toLowerCase();
    setIsSubmitted(true);
    
    if (correct) {
      const questionKey = `${currentQuestion.term.id}-${currentQuestion.type}`;
      if (!completedQuestions.has(questionKey)) {
        setAnsweredCount(answeredCount + 1);
        setCompletedQuestions(new Set([...completedQuestions, questionKey]));
      }
      
      setPoints(points + 10);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      
      const termProg = sessionProgress.get(currentQuestion.term.id) || { termId: currentQuestion.term.id, mcCorrect: 0, writtenCorrect: false };
      termProg.writtenCorrect = true;
      saveProgress(currentQuestion.term.id, termProg);
    } else {
      setMistakeTermIds(new Set([...mistakeTermIds, currentQuestion.term.id]));
      setStreak(0);
      
      const insertPosition = Math.min(
        currentQuestionIndex + 5 + Math.floor(Math.random() * 3),
        questions.length
      );
      const updatedQuestions = [...questions];
      updatedQuestions.splice(insertPosition, 0, currentQuestion);
      setQuestions(updatedQuestions);
    }
  };

  const handleWriteNext = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setUserInput('');
    setIsSubmitted(false);
  };

  if (currentQuestion.type === 'written') {
    return (
      <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto', display: 'grid', gap: 24, minHeight: '80vh' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Link href={`/sets/${params.id}`} style={{ fontWeight: 600 }}>← Back to set</Link>
            <div style={{ display: 'flex', gap: 32, fontSize: 14, color: '#c9cee7' }}>
              <span>Points: {points}</span>
              <span>Streak: {streak} 🔥</span>
            </div>
          </div>
          
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 8 }}>
              <div 
                style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #9ef5c0, #8dd9ac)',
                  transition: 'width 0.3s ease-out'
                }} 
              />
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#c9cee7', textAlign: 'right' }}>
              {answeredCount} / {totalQuestions} terms
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: 48, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c9cee7', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
              Write the Definition
            </p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 48 }}>
              {currentQuestion.term.term}
            </h2>
            
            <form onSubmit={handleSubmitWrite}>
              <input 
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your answer..."
                disabled={isSubmitted}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: isSubmitted ? (userInput.trim().toLowerCase() === currentQuestion.term.definition.trim().toLowerCase() ? '2px solid #9ef5c0' : '2px solid #ff6b6b') : '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#f7f7fb',
                  fontSize: '1.1rem',
                  marginBottom: 16
                }}
                autoFocus
              />
              
              {isSubmitted ? (
                <div>
                  {userInput.trim().toLowerCase() === currentQuestion.term.definition.trim().toLowerCase() ? (
                    <div style={{ background: 'rgba(158,245,192,0.15)', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid rgba(158,245,192,0.3)' }}>
                      <p style={{ margin: 0, color: '#9ef5c0', fontWeight: 600 }}>✓ Correct!</p>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(255,107,107,0.15)', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid rgba(255,107,107,0.3)' }}>
                      <p style={{ margin: 0, color: '#ff6b6b', fontWeight: 600, marginBottom: 8 }}>✗ Incorrect</p>
                      <p style={{ margin: 0, color: '#c9cee7' }}>Correct answer: {currentQuestion.term.definition}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleWriteNext}
                    style={{
                      width: '100%',
                      padding: '14px 28px',
                      borderRadius: 12,
                      border: 'none',
                      background: 'linear-gradient(145deg, #9ef5c0, #8dd9ac)',
                      color: '#1a1d2d',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  style={{
                    width: '100%',
                    padding: '14px 28px',
                    borderRadius: 12,
                    border: 'none',
                    background: userInput.trim() ? 'linear-gradient(145deg, #9ef5c0, #8dd9ac)' : 'rgba(255,255,255,0.06)',
                    color: userInput.trim() ? '#1a1d2d' : '#666',
                    cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}
                >
                  Check Answer
                </button>
              )}
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '32px', maxWidth: 960, margin: '0 auto', display: 'grid', gap: 24, minHeight: '80vh' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Link href={`/sets/${params.id}`} style={{ fontWeight: 600 }}>← Back to set</Link>
          <div style={{ display: 'flex', gap: 32, fontSize: 14, color: '#c9cee7' }}>
            <span>Points: {points}</span>
            <span>Streak: {streak} 🔥</span>
          </div>
        </div>
        
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 8 }}>
            <div 
              style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #9ef5c0, #8dd9ac)',
                transition: 'width 0.3s ease-out'
              }} 
            />
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#c9cee7', textAlign: 'right' }}>
            {answeredCount} / {totalQuestions} terms
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 48, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c9cee7', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
            {currentQuestion.type === 'mc-term-to-def' ? 'Select the Definition' : 'Select the Term'}
          </p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 48 }}>
            {currentQuestion.type === 'mc-term-to-def' ? currentQuestion.term.term : currentQuestion.term.definition}
          </h2>
          
          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
            {options.map((option, index) => {
              const correctAnswer = currentQuestion.type === 'mc-term-to-def' 
                ? currentQuestion.term.definition 
                : currentQuestion.term.term;
              const isSelected = selectedAnswer === option;
              const isThisCorrect = option === correctAnswer;
              
              let backgroundColor = 'rgba(255,255,255,0.04)';
              let borderColor = 'rgba(255,255,255,0.12)';
              
              if (isCorrect !== null) {
                if (isSelected) {
                  backgroundColor = isCorrect ? 'rgba(158,245,192,0.15)' : 'rgba(255,107,107,0.15)';
                  borderColor = isCorrect ? 'rgba(158,245,192,0.3)' : 'rgba(255,107,107,0.3)';
                } else if (isThisCorrect && !isCorrect) {
                  backgroundColor = 'rgba(158,245,192,0.1)';
                  borderColor = 'rgba(158,245,192,0.2)';
                }
              } else if (isSelected) {
                backgroundColor = 'rgba(142,160,246,0.15)';
                borderColor = 'rgba(142,160,246,0.3)';
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelectMCAnswer(option)}
                  disabled={isCorrect !== null}
                  style={{
                    padding: '20px 24px',
                    borderRadius: 12,
                    border: `2px solid ${borderColor}`,
                    background: backgroundColor,
                    color: '#f7f7fb',
                    cursor: isCorrect !== null ? 'default' : 'pointer',
                    textAlign: 'left',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
          
          {isCorrect !== null && (
            <div>
              {isCorrect ? (
                <div style={{ background: 'rgba(158,245,192,0.15)', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid rgba(158,245,192,0.3)' }}>
                  <p style={{ margin: 0, color: '#9ef5c0', fontWeight: 600 }}>✓ Correct!</p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,107,107,0.15)', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid rgba(255,107,107,0.3)' }}>
                  <p style={{ margin: 0, color: '#ff6b6b', fontWeight: 600, marginBottom: 8 }}>✗ Incorrect</p>
                  <p style={{ margin: 0, color: '#c9cee7' }}>
                    Correct answer: {currentQuestion.type === 'mc-term-to-def' ? currentQuestion.term.definition : currentQuestion.term.term}
                  </p>
                </div>
              )}
              <button
                onClick={handleNextQuestion}
                style={{
                  width: '100%',
                  padding: '14px 28px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(145deg, #9ef5c0, #8dd9ac)',
                  color: '#1a1d2d',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
