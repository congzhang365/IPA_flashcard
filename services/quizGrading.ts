import { IPAFeature, IPACardData } from '../types';
import { ipaDataset } from '../data/ipaData';

export type QuizFeedback = 'none' | 'correct' | 'partial' | 'incorrect';

export interface QuizGrade {
  score: 0 | 0.5 | 1;
  feedback: Exclude<QuizFeedback, 'none'>;
  matchedLabels: string[];
  expectedLabels: string[];
}

const normalize = (value: string) => value
  .normalize('NFKC')
  .toLocaleLowerCase()
  .replace(/[‐‑‒–—−]/g, '-')
  .trim();

const labelTerms = (value: string) => normalize(value)
  .split(/\s+/)
  .map(term => term.replace(/^[.,;:!?]+|[.,;:!?]+$/g, ''))
  .filter(Boolean);

const meaningfulLabelTerms = (value: string) => labelTerms(value)
  .filter(term => term !== 'vowel' && term !== 'consonant');

const termParts = (term: string) => term.split('-').filter(Boolean);

const matchingLabelTerms = (expected: string, answer: string) => {
  const expectedTerms = meaningfulLabelTerms(expected);
  const answerTerms = meaningfulLabelTerms(answer);
  const usedAnswerTerms = new Set<number>();
  const matchedTerms: string[] = [];

  expectedTerms.forEach(expectedTerm => {
    const expectedParts = termParts(expectedTerm);
    const answerIndex = answerTerms.findIndex((answerTerm, index) => {
      if (usedAnswerTerms.has(index)) return false;
      return expectedTerm === answerTerm || expectedParts.some(part => termParts(answerTerm).includes(part));
    });

    if (answerIndex !== -1) {
      usedAnswerTerms.add(answerIndex);
      matchedTerms.push(expectedTerm);
    }
  });

  return { expectedTerms, matchedTerms };
};

const gradeLabelComparison = (expectedLabel: string, answerLabel: string): QuizGrade => {
  const { expectedTerms, matchedTerms } = matchingLabelTerms(expectedLabel, answerLabel);
  const score: 0 | 0.5 | 1 = matchedTerms.length >= expectedTerms.length
    ? 1
    : expectedTerms.length >= 2 && matchedTerms.length === expectedTerms.length - 1
      ? 0.5
      : 0;

  return {
    score,
    feedback: score === 1 ? 'correct' : score === 0.5 ? 'partial' : 'incorrect',
    matchedLabels: matchedTerms,
    expectedLabels: expectedTerms,
  };
};

const stripLengthMarks = (value: string) => value.replace(/[ːˑ]/g, '');
// IPA modifiers are meaningful: compatibility normalisation turns e.g. ʰ into h.
const normalizeIPA = (value: string) => value.normalize('NFD').trim().replace(/g/g, 'ɡ').replace(/˘/g, '̆');

export const gradeQuizAnswer = (
  card: IPACardData,
  input: string,
  targetFeature: IPAFeature,
): QuizGrade => {
  const answer = normalize(input);

  if (!answer) {
    return { score: 0, feedback: 'incorrect', matchedLabels: [], expectedLabels: [] };
  }

  if (targetFeature === IPAFeature.SYMBOL) {
    const expected = normalizeIPA(card.symbol);
    const ipaAnswer = normalizeIPA(input);
    const isExact = ipaAnswer === expected || (card.category !== 'diacritic' && stripLengthMarks(ipaAnswer) === stripLengthMarks(expected));
    if (isExact) {
      return { score: 1, feedback: 'correct', matchedLabels: [expected], expectedLabels: [expected] };
    }

    // A wrong tone letter or modifier must not earn full marks merely because
    // its short label shares words with another diacritic (e.g. high/extra high).
    if (card.category === 'diacritic') {
      return { score: 0, feedback: 'incorrect', matchedLabels: [], expectedLabels: [expected] };
    }
    const symbolCard = ipaDataset.find(candidate => normalizeIPA(candidate.symbol) === ipaAnswer);
    return symbolCard
      ? gradeLabelComparison(card.label, symbolCard.label)
      : { score: 0, feedback: 'incorrect', matchedLabels: [], expectedLabels: [expected] };
  }

  if (targetFeature === IPAFeature.LABEL) {
    // A symbol answer can identify another card whose label is the user's answer.
    // For example, "o" resolves to "Close-mid back rounded vowel".
    const symbolCard = ipaDataset.find(candidate => normalizeIPA(candidate.symbol) === normalizeIPA(input));
    const answerLabel = symbolCard?.label ?? answer;
    if (card.category === 'diacritic') {
      const cleanLabel = (value: string) => normalize(value).replace(/-/g, ' ').replace(/\s+/g, ' ');
      const exact = cleanLabel(answerLabel) === cleanLabel(card.label);
      return { score: exact ? 1 : 0, feedback: exact ? 'correct' : 'incorrect', matchedLabels: exact ? [card.label] : [], expectedLabels: [card.label] };
    }
    return gradeLabelComparison(card.label, answerLabel);
  }

  // Examples are supporting reference material, not quiz targets.
  return { score: 0, feedback: 'incorrect', matchedLabels: [], expectedLabels: [] };
};
