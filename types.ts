
export enum IPAFeature {
  SYMBOL = 'SYMBOL',
  LABEL = 'LABEL',
  SOUND = 'SOUND',
  WORDS = 'WORDS'
}

export enum LearningStatus {
  REMEMBERED = 'REMEMBERED',
  MAYBE = 'MAYBE',
  NO = 'NO',
  UNSEEN = 'UNSEEN'
}

export interface IPACardData {
  id: string;
  symbol: string;
  label: string;
  words?: string[];
  audioPrompts?: string[]; 
  category: 'consonant' | 'vowel' | 'diacritic';
}

export type StudyMode = 'FLASHCARD' | 'QUIZ';

export interface AppSettings {
  activeFeatures: IPAFeature[]; // For Folded mode (3+ features)
  promptFeature: IPAFeature;   // The one the user sees first
  maskedFeature: IPAFeature;   // The one the user needs to guess
  mode: StudyMode;
}

export interface CardState {
  currentQueueIndex: number;
  isFlipped: boolean;
  userInput: string;
  feedback: 'none' | 'correct' | 'incorrect';
}
