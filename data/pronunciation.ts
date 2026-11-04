import type { IPACardData, PronunciationPart } from '../types';
import { lexicalExamples } from './wordExamples';
import { notationCues } from './chartData';

/** Reviewed literal annotations, not a slash detector. Ordinary a/b prose stays prose.
 * Raw source tips remain unchanged until the content review is approved.
 */
const ipaFragments: Readonly<Record<string, readonly string[]>> = {
  "C001": [
    "/s/"
  ],
  "C003": [
    "/s/"
  ],
  "C009": [
    "[k]",
    "/s/"
  ],
  "C010": [
    "[ɡ]"
  ],
  "C011": [
    "[k]"
  ],
  "C012": [
    "[g]"
  ],
  "C015": [
    "[m]"
  ],
  "C039": [
    "[i]"
  ],
  "C040": [
    "[i]"
  ],
  "C041": [
    "[k]"
  ],
  "C042": [
    "[g]"
  ],
  "C043": [
    "[q]",
    "[x]"
  ],
  "C044": [
    "[R]"
  ],
  "C049": [
    "[l]"
  ],
  "C050": [
    "[l]"
  ],
  "C051": [
    "[v]"
  ],
  "C052": [
    "/r/"
  ],
  "C053": [
    "/r/"
  ],
  "C054": [
    "[i]"
  ],
  "C055": [
    "[g]",
    "[ɣ]",
    "[w]"
  ],
  "C058": [
    "[j]"
  ],
  "C067": [
    "[ɟ]"
  ],
  "C068": [
    "[ɡ]"
  ],
  "C069": [
    "[ɢ]"
  ],
  "C071": [
    "[u]"
  ],
  "C072": [
    "[y]"
  ],
  "C073": [
    "[h]"
  ],
  "C075": [
    "[ʔ]"
  ],
  "C077": [
    "[ɕ]"
  ],
  "V081": [
    "[i]"
  ],
  "V082": [
    "[ɪ]"
  ],
  "V083": [
    "[i]"
  ],
  "V084": [
    "[e]"
  ],
  "V085": [
    "[e]"
  ],
  "V086": [
    "[ø]"
  ],
  "V087": [
    "[a]",
    "[æ]"
  ],
  "V090": [
    "[i]",
    "[ɯ]"
  ],
  "V091": [
    "[y]",
    "[u]",
    "/u/"
  ],
  "V092": [
    "[e]",
    "[ə]"
  ],
  "V093": [
    "[ø]",
    "[o]"
  ],
  "V097": [
    "[a]",
    "[ə]"
  ],
  "V098": [
    "[u]"
  ],
  "V099": [
    "[w]",
    "/u/"
  ],
  "V101": [
    "[o]"
  ],
  "C079": [
    "[ʃ]",
    "[x]"
  ],
  "C083": [
    "[s]"
  ]
};

const diacriticFragments: Readonly<Record<string, readonly string[]>> = {
  D107: ['d̥', 'n̥'], D108: ['s̬', 't̬'], D109: ['tʰ', 'pʰ'],
  D110: ['ɔ̹'], D111: ['ɔ̜'], D112: ['u̟'], D113: ['e̠'],
  D114: ['ë'], D115: ['e̽'], D116: ['n̩', 'l̩'], D117: ['e̯'],
  D118: ['ə˞', 'ɚ'], D119: ['b̤', 'a̤'], D120: ['a̰', 'b̰'],
  D121: ['t̼', 'd̼'], D122: ['tʷ', 'dʷ'], D123: ['tʲ', 'dʲ'],
  D124: ['tˠ', 'dˠ'], D125: ['tˤ', 'dˤ'], D126: ['l̴'],
  D127: ['e̝', 'e'], D128: ['e̞', 'e'], D129: ['e̘'], D130: ['e̙'],
  D131: ['t̪', 'd̪'], D132: ['t̺', 'd̺'], D133: ['t̻', 'd̻'],
  D134: ['ẽ', 'ã'], D135: ['dⁿ'], D136: ['dˡ'], D137: ['d̚', 'p̚'],
  D138: ['pʼ', 'tʼ', 'kʼ'], D141: ['aː', 'sː'], D142: ['aˑ'],
  D143: ['˘a'], D147A: ['t͡s'], D147B: ['t͜s'],
  D167: ['a˥'], D168: ['a˦'], D169: ['a˧'], D170: ['a˨'], D171: ['a˩'],
  D172: ['a˩˥'], D173: ['a˥˩'], D174: ['a˧˥'], D175: ['a˩˧'], D176: ['a˧˦˨'],
};

export function splitAnnotatedText(text: string, fragments: readonly string[]): PronunciationPart[] {
  const parts: PronunciationPart[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    let next = -1;
    let fragment = '';
    for (const candidate of fragments) {
      let index = candidate ? text.indexOf(candidate, cursor) : -1;
      // A literal single-letter annotation must not match inside English prose.
      if (candidate.length === 1) {
        while (index !== -1 && ((index > 0 && /[\p{L}\p{M}]/u.test(text[index - 1]))
          || (index + 1 < text.length && /[\p{L}\p{M}]/u.test(text[index + 1])))) index = text.indexOf(candidate, index + 1);
      }
      if (index !== -1 && (next === -1 || index < next || (index === next && candidate.length > fragment.length))) {
        next = index; fragment = candidate;
      }
    }
    if (next === -1) { parts.push({ kind: 'text', text: text.slice(cursor) }); break; }
    if (next > cursor) parts.push({ kind: 'text', text: text.slice(cursor, next) });
    parts.push({ kind: 'ipa', text: fragment });
    cursor = next + fragment.length;
  }
  return parts;
}

/** One content path for cards, persistent chart details and chart tooltips. */
export function pronunciationContent(card: Pick<IPACardData, 'id' | 'pronunciationTip' | 'words'>) {
  const text = card.pronunciationTip || notationCues[card.id]
    || (card.id.startsWith('D') ? (card.words ?? []).filter((word): word is string => typeof word === 'string').join(' ') : '');
  return { tip: splitAnnotatedText(text, [...(ipaFragments[card.id] ?? []), ...(diacriticFragments[card.id] ?? [])]), example: lexicalExamples[card.id] };
}
