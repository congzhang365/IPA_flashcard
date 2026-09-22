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
const SUPERSCRIPT_AFTER = new Set(['̚', 'ʰ', 'ʷ', 'ʲ', 'ˠ', 'ˤ', 'ⁿ', 'ˡ', '˞', 'ʼ']);
const ABOVE_MARKS = new Set(['̈', '̃', '̋', '́', '̄', '̀', '̏', '̌', '̂', '᷄', '᷅', '᷈']);
const ABOVE_SPACING_MARKS = new Set(['˘']);
const BELOW_MARKS = new Set(['̥', '̬', '̹', '̜', '̟', '̠', '̩', '̯', '̤', '̰', '̼', '̪', '̺', '̻', '̚', '̝', '̞', '̘', '̙']);

type DiacriticLayout = {
  kind: 'prefix' | 'tie-above' | 'tie-below' | 'superscript' | 'above' | 'below' | 'after';
  x?: string;
  y?: string;
  scale?: string;
};

// Individual adjustments are intentional: IPA marks do not all share the same visual anchor.
const INDIVIDUAL_LAYOUT: Record<string, DiacriticLayout> = {
  'ˈ': { kind: 'prefix', x: '0em', y: '0em' }, 'ˌ': { kind: 'prefix', x: '0em', y: '0em' },
  '͡': { kind: 'tie-above', x: '-40%', y: '-0.1em', scale: '1' },
  '͜': { kind: 'tie-below', x: '-40%', y: '-0.1em', scale: '1' },
  '̥': { kind: 'below', x: '50%', y: '-0.1em' },
  '̝': { kind: 'below', x:'0.25em', y: '-0.1em' },
  '̞': { kind: 'below', x: '50%', y: '-0.1em' },
  '̩': { kind: 'below', x: '95%', y: '-0.1em' },
  '̯': { kind: 'below', x: '50%', y: '-0.1em' },
  '̬': { kind: 'below', x: '50%', y: '-0.1em' },
  '̜': { kind: 'below', x: '50%', y: '-0.1em' },
  '̹': { kind: 'below', x: '50%', y: '-0.1em' },
  '̟': { kind: 'below', x: '50%', y: '-0.1em' },
  '̠': { kind: 'below', x: '50%', y: '-0.1em' },
  '̽': { kind: 'below', x: '50%', y: '-0em' },
  '̤': { kind: 'below', x: '50%', y: '-0.1em' },
  '̰': { kind: 'below', x: '50%', y: '-0.1em' },
  '̼': { kind: 'below', x: '50%', y: '-0.1em' },
  '̪': { kind: 'below', x: '50%', y: '-0.1em' },
  '̺': { kind: 'below', x: '50%', y: '-0.1em' },
  '̻': { kind: 'below', x: '50%', y: '-0.1em' },
  '̘': { kind: 'below', x: '50%', y: '-0.1em' },
  '̙': { kind: 'below', x: '50%', y: '-0.1em' },
  '̃': { kind: 'above', x: '90%', y: '-0.1em' },
  '̈': { kind: 'above', x: '100%', y: '-0.1em' },
  '̋': { kind: 'above', x: '50%', y: '-0.1em' },
  '́': { kind: 'above', x: '90%', y: '-0.1em' },
  '̄': { kind: 'above', x:'0.5em', y: '-0.1em' },
  '̀': { kind: 'above', x: '90%', y: '-0.1em' },
  '̏': { kind: 'above', x: '50%', y: '-0.1em' },
  '̌': { kind: 'above', x: '50%', y: '-0.1em' },
  '̂': { kind: 'above', x: '50%', y: '-0.1em' },
  '᷄': { kind: 'above', x: '50%', y: '-0.1em' },
  '᷅': { kind: 'above', x: '50%', y: '-0.1em' },
  '᷈': { kind: 'above', x: '50%', y: '-0.1em' },
  '˘': { kind: 'above', x: '50%', y: '-0.1em' },
  'ː': { kind: 'after', x: '0em', y: '0em' },
  'ˑ': { kind: 'after', x: '0em', y: '0em' },
  '̚': { kind: 'superscript', x: '100%', y: '-0.1em' },
  'ʰ': { kind: 'superscript', x: '100%', y: '-0.1em' },
  'ʷ': { kind: 'superscript', x: '100%', y: '-0.1em' },
  'ʲ': { kind: 'superscript', x: '100%', y: '-0.1em' },
  'ˠ': { kind: 'superscript', x: '100%', y: '-0.1em' },
  'ˤ': { kind: 'superscript', x: '100%', y: '-0.1em' },
  'ⁿ': { kind: 'superscript', x: '100%', y: '-0.1em' },
  'ˡ': { kind: 'superscript', x: '100%', y: '-0.1em' },
  '˞': { kind: 'superscript', x: '90%', y: '0.1em' },
  'ʼ': { kind: 'after', x: '0em', y: '0em' },
};

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
  const layout = INDIVIDUAL_LAYOUT[symbol] ?? (
    isPreVowel ? { kind: 'prefix' as const } :
    isTieBar ? { kind: symbol === '͡' ? 'tie-above' as const : 'tie-below' as const, y: '-0.32em', scale: '1.8' } :
    SUPERSCRIPT_AFTER.has(symbol) ? { kind: 'superscript' as const, x: '62%', y: '-0.3em' } :
    markPosition === 'above' ? { kind: 'above' as const, y: '-0.28em' } :
    markPosition === 'below' ? { kind: 'below' as const, y: '-0.45em' } :
    { kind: 'after' as const }
  );

  if (layout.kind === 'prefix') {
    return (
      <span className={`ipa-font inline-flex items-center ${className}`} title={`Example placement: ${symbol}${base}`}>
        <span className="text-slate-800" style={{ position: layout.x || layout.y ? 'relative' : undefined, left: layout.x, top: layout.y }}>{symbol}</span><span className="text-slate-300">{base}</span>
      </span>
    );
  }

  if (layout.kind === 'tie-above' || layout.kind === 'tie-below') {
    return (
      <span className={`ipa-font relative inline-block leading-none ${className}`} title={`Example placement: t${symbol}s`}>
        <span className="text-slate-300 tracking-wide">ts</span>
        <span className="absolute text-center text-slate-800" style={{ left: layout.x ?? '0', width: '100%', [layout.kind === 'tie-above' ? 'top' : 'bottom']: layout.y, transform: `scaleX(${layout.scale})` }}>{symbol}</span>
      </span>
    );
  }

  if (layout.kind === 'superscript') {
    return (
      <span className={`ipa-font relative inline-flex items-center ${className}`} title={`Example placement: ${base}${symbol}`}>
        <span className="text-slate-300">{base}</span>
        <span className="absolute text-[0.75em] leading-none text-slate-800" style={{ left: layout.x, top: layout.y }}>{symbol}</span>
      </span>
    );
  }

  return (
    <span className={`ipa-font relative inline-flex items-center justify-center ${className}`} title={`Example placement: ${base}${symbol}`}>
      <span className="text-slate-300">{base}</span>
      {(isCombining || isAboveSpacingMark) && (layout.kind === 'above' || layout.kind === 'below') ? (
        <span className="absolute -translate-x-1/2 text-slate-800" style={{ left: layout.x ?? '50%', [layout.kind === 'above' ? 'top' : 'bottom']: layout.y }}>{symbol}</span>
      ) : isCombining ? (
        <span className="absolute inset-0 flex items-center justify-center text-slate-800">{symbol}</span>
      ) : (
        <span className="text-slate-800" style={{ position: layout.x || layout.y ? 'relative' : undefined, left: layout.x, top: layout.y }}>{symbol}</span>
      )}
    </span>
  );
};
