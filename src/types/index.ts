export interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Submission {
  id: string;
  questionId: number;
  question: string;
  gptAnswer: string;
  userId: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SearchResponse {
  answer: string;
  sources?: string[];
  confidence?: number;
}