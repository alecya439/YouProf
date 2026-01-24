export type StudySetVisibility = "public" | "private";

export type StudyTerm = {
  id: string;
  term: string;
  definition: string;
  imageUrl?: string;
  audioUrl?: string;
};

export type StudySet = {
  id: string;
  title: string;
  description?: string;
  visibility: StudySetVisibility;
  terms: StudyTerm[];
  createdAt: string;
  updatedAt: string;
};

export type StudySessionResult = {
  setId: string;
  known: number;
  unknown: number;
  durationSeconds: number;
  completedAt: string;
};

export type TermMastery = {
  termId: string;
  mistakes: number;
  timesCorrect: number;
  lastSeen: string;
};

export type LearnSession = {
  setId: string;
  goal: 'terms' | 'time';
  goalValue: number;
  points: number;
  streak: number;
  mistakeTerms: string[];
  masteredTerms: Map<string, TermMastery>;
  startedAt: string;
};
