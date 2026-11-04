import { IPACardData } from '../types';

/** New cards only. Existing accent-tone cards and IDs are preserved. */
export const additionalToneCards: IPACardData[] = [
  { id: 'D167', symbol: '˥', label: 'extra high tone', category: 'diacritic', words: ['Extra-high level tone, shown after a vowel: a˥.'] },
  { id: 'D168', symbol: '˦', label: 'high tone', category: 'diacritic', words: ['High level tone, shown after a vowel: a˦.'] },
  { id: 'D169', symbol: '˧', label: 'mid tone', category: 'diacritic', words: ['Mid level tone, shown after a vowel: a˧.'] },
  { id: 'D170', symbol: '˨', label: 'low tone', category: 'diacritic', words: ['Low level tone, shown after a vowel: a˨.'] },
  { id: 'D171', symbol: '˩', label: 'extra low tone', category: 'diacritic', words: ['Extra-low level tone, shown after a vowel: a˩.'] },
  { id: 'D172', symbol: '˩˥', label: 'rising tone', category: 'diacritic', words: ['A pitch contour rising from low to high: a˩˥.'] },
  { id: 'D173', symbol: '˥˩', label: 'falling tone', category: 'diacritic', words: ['A pitch contour falling from high to low: a˥˩.'] },
  { id: 'D174', symbol: '˧˥', label: 'high rising tone', category: 'diacritic', words: ['A pitch contour rising from mid to extra-high: a˧˥.'] },
  { id: 'D175', symbol: '˩˧', label: 'low rising tone', category: 'diacritic', words: ['A pitch contour rising from extra-low to mid: a˩˧.'] },
  { id: 'D176', symbol: '˧˦˨', label: 'rising-falling tone', category: 'diacritic', words: ['A pitch contour that rises and then falls: a˧˦˨.'] },
  { id: 'D177', symbol: '↗', label: 'global rise', category: 'diacritic', words: ['An overall rise in pitch across an intonation phrase.'] },
  { id: 'D178', symbol: '↘', label: 'global fall', category: 'diacritic', words: ['An overall fall in pitch across an intonation phrase.'] },
];
