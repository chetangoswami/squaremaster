
export enum AppView {
  HOME = 'HOME',
  GAME = 'GAME',
  RESULTS = 'RESULTS',
  STUDY = 'STUDY',
  STATS = 'STATS'
}

export type GameMode = 'SQUARES' | 'MULTIPLICATION' | 'ADDITION' | 'SUBTRACTION' | 'DIVISION';

export interface GameSettings {
  mode: GameMode;
  min: number;
  max: number;
  min2: number; // For multiplication second operand
  max2: number; // For multiplication second operand
  duration: number; // in seconds
  smartMode: boolean;
  kidMode: boolean;
  optionsMode?: boolean; // Enable multiple choice options
}

export interface Question {
  mode: GameMode;
  val1: number;
  val2?: number; // undefined for SQUARES
  answer: number;
  isRetry?: boolean; // Indicates this is a spaced repetition question
}

export interface AnswerRecord {
  question: Question;
  userAnswer: number;
  isCorrect: boolean;
  timeTaken: number; // ms
}

export interface GameStats {
  totalQuestions: number;
  correct: number;
  score: number;
  history: AnswerRecord[];
  startTime: number;
  endTime: number;
  problematicKeys: string[];
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  mode: GameMode;
  score: number;
  total: number;
  correct: number;
  isKid: boolean;
  history?: AnswerRecord[];
}
