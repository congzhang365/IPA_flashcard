import React from 'react';

const BASE_BY_DIACRITIC: Record<string, string> = {
  '̥': 'd',
  '̬': 's',
  'ʰ': 't',
  '̹': 'ɔ',
  '̜': 'ɔ',
  '̟': 'u',
  '̠': 'e',
  '̈': 'e',
  '̽': 'e',
  '̩': 'n',
  '̯': 'e',
  '˞': 'ə',
  '̤': 'b',
  '̰': 'a',
  '̼': 't',
  'ʷ': 't',
  'ʲ': 't',
  'ˠ': 't',
  'ˤ': 't',
  '̴': 'l',
  '̝': 'e',
  '̞': 'e',
  '̘': 'a',
  '̙': 'a',
  '̪': 't',
  '̺': 't',
  '̻': 't',
  '̃': 'a',
  'ⁿ': 't',
  'ˡ': 't',
  '̚': 't',
  'ʼ': 't',
  'ˈ': 'a',
  'ˌ': 'a',
  'ː': 'a',
  'ˑ': 'a',
  '˘': 'a',
  '͡': 't',
  '͜': 't',
  '̋': 'a',
  '́': 'a',
  '̄': 'a',
  '̀': 'a',
  '̏': 'a',
  '̌': 'a',
  '̂': 'a',
  '᷄': 'a',
  '᷅': 'a',
  '᷈': 'a',
};

const PRE_VOWEL = new Set([
  'ˈ',
  'ˌ',
]);

const TIE_BARS = new Set([
  '͡',
  '͜',
]);

/*
 * These are spacing/modifier characters rather than combining marks,
 * so they can safely be coloured separately.
 */
const SPACING_MARKS = new Set([
  'ʰ',
  '˞',
  'ʷ',
  'ʲ',
  'ˠ',
  'ˤ',
  'ⁿ',
  'ˡ',
  'ʼ',
  'ː',
  'ˑ',
  '˘',
]);

interface DiacriticExampleProps {
  symbol: string;
  className?: string;
}

interface CharacterProps {
  children: React.ReactNode;
}

/*
 * Consistent styling for every carrier/base character.
 *
 * The tiny stroke deliberately gives all bases the same fine edge,
 * rather than only some layered examples having an accidental halo.
 */
const BASE_STYLE: React.CSSProperties = {
  color: '#cbd5e1',
  WebkitTextStroke: '0.2px #94a3b8',
  paintOrder: 'stroke fill',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  fontStyle: 'inherit',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
};

const MARK_STYLE: React.CSSProperties = {
  color: '#1e293b',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  fontStyle: 'inherit',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
};

const Base: React.FC<CharacterProps> = ({ children }) => (
  <span style={BASE_STYLE}>
    {children}
  </span>
);

const Mark: React.FC<CharacterProps> = ({ children }) => (
  <span style={MARK_STYLE}>
    {children}
  </span>
);

export const DiacriticExample: React.FC<DiacriticExampleProps> = ({
  symbol,
  className = '',
}) => {
  const base = BASE_BY_DIACRITIC[symbol] ?? 'a';

  const example = PRE_VOWEL.has(symbol)
    ? `${symbol}${base}`
    : TIE_BARS.has(symbol)
      ? `t${symbol}s`
      : `${base}${symbol}`;

  /*
   * Stress marks:
   * ˈa
   * ˌa
   */
  if (PRE_VOWEL.has(symbol)) {
    return (
      <span
        className={`ipa-font inline-block whitespace-nowrap leading-none ${className}`}
        title={`Example placement: ${example}`}
      >
        <Mark>{symbol}</Mark>
        <Base>{base}</Base>
      </span>
    );
  }

  /*
   * Spacing/modifier marks:
   * tʰ, tʷ, ə˞, aː etc.
   *
   * These do not depend on combining-mark shaping, so normal
   * separate spans are the cleanest solution.
   */
  if (SPACING_MARKS.has(symbol)) {
    return (
      <span
        className={`ipa-font inline-block whitespace-nowrap leading-none ${className}`}
        title={`Example placement: ${example}`}
      >
        <Base>{base}</Base>
        <Mark>{symbol}</Mark>
      </span>
    );
  }

  /*
   * Tie bars:
   * t͡s
   * t͜s
   *
   * Render the complete sequence underneath in dark so the font
   * can shape the tie bar naturally across both letters.
   *
   * Then place grey "ts" directly on top.
   */
  if (TIE_BARS.has(symbol)) {
    return (
      <span
        className={`ipa-font relative inline-block whitespace-nowrap leading-none ${className}`}
        title={`Example placement: ${example}`}
        style={{
          fontKerning: 'none',
        }}
      >
        {/* Full correctly shaped sequence */}
        <span
          style={{
            color: '#1e293b',
            fontKerning: 'none',
          }}
        >
          t{symbol}s
        </span>

        {/* Grey carrier letters */}
        <span
          aria-hidden="true"
          style={{
            ...BASE_STYLE,
            position: 'absolute',
            left: 0,
            top: 0,
            fontKerning: 'none',
            pointerEvents: 'none',
          }}
        >
          ts
        </span>
      </span>
    );
  }

  /*
   * U+0334 COMBINING TILDE OVERLAY is unusual because the
   * diacritic passes THROUGH the base character.
   *
   * The normal layering method would cause the grey "l" to cover
   * the dark tilde, so give this symbol its own visual treatment.
   */
  if (symbol === '̴') {
    return (
      <span
        className={`ipa-font relative inline-block whitespace-nowrap leading-none ${className}`}
        title="Example placement: l̴"
      >
        <Base>l</Base>

        <span
          aria-hidden="true"
          style={{
            position: 'absolute',

            /*
             * These values control the visual position of the
             * tilde through the l. They are isolated here so they
             * can be adjusted without affecting other diacritics.
             */
            left: '50%',
            top: '51%',
            transform: 'translate(-50%, -50%)',

            color: '#1e293b',
            fontFamily: 'inherit',
            fontSize: '0.72em',
            fontWeight: 'inherit',
            lineHeight: 1,

            pointerEvents: 'none',
          }}
        >
          ~
        </span>
      </span>
    );
  }

  /*
   * Genuine combining marks:
   *
   * Bottom layer:
   *    e̞
   * rendered as one uninterrupted Unicode sequence in dark.
   *
   * Top layer:
   *    e
   * rendered in grey.
   *
   * Result:
   *    grey base + dark combining diacritic,
   * while retaining the font's natural diacritic positioning.
   */
  return (
    <span
      className={`ipa-font relative inline-block whitespace-nowrap leading-none ${className}`}
      title={`Example placement: ${example}`}
    >
      {/* Full sequence, allowing normal Unicode shaping */}
      <span
        style={{
          color: '#1e293b',
        }}
      >
        {base}{symbol}
      </span>

      {/* Grey copy of the base over the dark base */}
      <span
        aria-hidden="true"
        style={{
          ...BASE_STYLE,
          position: 'absolute',
          left: 0,
          top: 0,
          pointerEvents: 'none',
        }}
      >
        {base}
      </span>
    </span>
  );
};