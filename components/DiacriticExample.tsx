import React from 'react';

const BASE_BY_DIACRITIC: Record<string, string> = {
  '̥': 'd', '̬': 's', 'ʰ': 't', '̹': 'ɔ', '̜': 'ɔ', '̟': 'u', '̠': 'e', '̈': 'e',
  '̽': 'e', '̩': 'n', '̯': 'e', '˞': 'ə', '̤': 'b', '̰': 'a', '̼': 't', 'ʷ': 't',
  'ʲ': 't', 'ˠ': 't', 'ˤ': 't', '̴': 'l', '̝': 'e', '̞': 'e', '̘': 'a', '̙': 'a',
  '̪': 't', '̺': 't', '̻': 't', '̃': 'a', 'ⁿ': 't', 'ˡ': 't', '̚': 't', 'ʼ': 't',
  'ˈ': 'a', 'ˌ': 'a', 'ː': 'a', 'ˑ': 'a', '˘': 'a', '͡': 't', '͜': 't',
  '̋': 'a', '́': 'a', '̄': 'a', '̀': 'a', '̏': 'a', '̌': 'a', '̂': 'a',
  '᷄': 'a', '᷅': 'a', '᷈': 'a',
};

const PRE_VOWEL = new Set(['ˈ', 'ˌ']);
const TIE_BARS = new Set(['͡', '͜']);
const ABOVE_MARKS = new Set(['̈', '̃', '̋', '́', '̄', '̀', '̏', '̌', '̂', '᷄', '᷅', '᷈']);
const ABOVE_SPACING_MARKS = new Set(['˘']);
const BELOW_MARKS = new Set(['̥', '̬', '̹', '̜', '̟', '̠', '̩', '̯', '̤', '̰', '̼', '̪', '̺', '̻', '̚', '̝', '̞', '̘', '̙']);

interface DiacriticExampleProps {
  symbol: string;
  className?: string;
}

export const DiacriticExample: React.FC<DiacriticExampleProps> = ({ symbol, className = '' }) => {
  const base = BASE_BY_DIACRITIC[symbol] ?? 'a';
  const isCombining = /\p{M}/u.test(symbol);
  const isAboveSpacingMark = ABOVE_SPACING_MARKS.has(symbol);
  const isTieBar = TIE_BARS.has(symbol);
  const isPreVowel = PRE_VOWEL.has(symbol);
  const markPosition = ABOVE_MARKS.has(symbol) || isAboveSpacingMark ? 'above' : BELOW_MARKS.has(symbol) ? 'below' : 'overlay';

  if (isPreVowel) {
    return (
      <span className={`ipa-font inline-flex items-center ${className}`} title={`Example placement: ${symbol}${base}`}>
        <span className="text-slate-800">{symbol}</span><span className="text-slate-300">{base}</span>
      </span>
    );
  }

  if (isTieBar) {
    return (
      <span className={`ipa-font relative inline-block leading-none ${className}`} title={`Example placement: t${symbol}s`}>
        <span className="text-slate-300 tracking-wide">ts</span>
        <span className={`absolute left-0 right-0 h-[0.08em] rounded-full bg-slate-800 ${symbol === '͡' ? '-top-[0.12em]' : '-bottom-[0.12em]'}`} />
      </span>
    );
  }

  return (
    <span className={`ipa-font relative inline-flex items-center justify-center ${className}`} title={`Example placement: ${base}${symbol}`}>
      <span className="text-slate-300">{base}</span>
      {(isCombining || isAboveSpacingMark) && markPosition !== 'overlay' ? (
        <span className={`absolute left-1/2 -translate-x-1/2 text-slate-800 ${markPosition === 'above' ? '-top-[0.28em]' : '-bottom-[0.45em]'}`}>{symbol}</span>
      ) : isCombining ? (
        <span className="absolute inset-0 flex items-center justify-center text-slate-800">{symbol}</span>
      ) : (
        <span className="text-slate-800">{symbol}</span>
      )}
    </span>
  );
};
