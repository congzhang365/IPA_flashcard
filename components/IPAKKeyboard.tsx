import React, { useRef } from 'react';

export type KeyboardGroup = 'Consonants' | 'Vowels' | 'Diacritics';

const GROUPS: Record<KeyboardGroup, string[]> = {
  Consonants: [
    'p', 'b', 'ɓ', 'ɸ', 'β', 'f', 'v', 'ⱱ', 't', 'd', 'ɗ', 'ʈ', 'ɖ', 'θ', 'ð',
    'k', 'ɡ', 'ɠ', 'q', 'ɢ', 'ʛ', 'x', 'ɣ', 'χ', 'ʁ', 'm', 'ɱ', 'n', 'ɳ', 'ɲ', 'ŋ', 'ɴ',
    's', 'z', 'ʃ', 'ʒ', 'ʂ', 'ʐ', 'ɕ', 'ʑ', 'ç', 'ʝ', 'r', 'ɾ', 'ɽ', 'ʀ', 'ʙ', 'ɺ',
    'l', 'ɬ', 'ɮ', 'ɭ', 'ʎ', 'ʟ', 'h', 'ɦ', 'ħ', 'ʕ', 'ʜ', 'ʔ', 'ʡ', 'ʢ', 'ɧ',
    'w', 'ʍ', 'ɥ', 'j', 'ɰ', 'ɹ', 'ɻ', 'ʋ', 'c', 'ɟ', 'ʄ', 'ʘ', 'ǀ', 'ǃ', 'ǂ', 'ǁ',
  ],
  Vowels: [
    'i', 'y', 'ɪ', 'ʏ', 'ɨ', 'ʉ', 'e', 'ə', 'ɘ', 'ɛ', 'ɜ', 'ɞ', 'o', 'ø', 'ɵ', 'ɔ', 'œ',
    'a', 'ɑ', 'ɐ', 'ɒ', 'æ', 'ɶ', 'u', 'ɯ', 'ʊ', 'ʌ', 'ɤ',
  ],
  Diacritics: [
    'ˈ', 'ˌ', 'ː', 'ˑ', 'ʼ', '˘', '◌̥', '◌̬', '◌ʰ', '◌̹', '◌̜', '◌̟', '◌̠', '◌̈',
    '◌̽', '◌̩', '◌̯', '◌˞', '◌̤', '◌̰', '◌̼', '◌̪', '◌̺', '◌̻', '◌̃', '◌ⁿ', '◌ˡ',
    '◌ʷ', '◌ʲ', '◌ˠ', '◌ˤ', '◌̴', '◌̚', '◌̋', '◌́', '◌̄', '◌̀', '◌̏', '◌̌', '◌̂',
    '◌᷄', '◌᷅', '◌᷈', '◌͡', '◌͜', '◌̝', '◌̞', '◌̘', '◌̙',
  ],
};

interface IPAKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  group: KeyboardGroup;
  onGroupChange: (group: KeyboardGroup) => void;
}

export const IPAKeyboard: React.FC<IPAKeyboardProps> = ({ value, onChange, inputRef, group, onGroupChange }) => {
  const fallbackRef = useRef<HTMLInputElement | null>(null);

  const insert = (rawSymbol: string) => {
    const symbol = rawSymbol.replace(/^◌/, '');
    const input = inputRef?.current ?? fallbackRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    const nextValue = value.slice(0, start) + symbol + value.slice(end);
    onChange(nextValue);

    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  };

  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white/80 p-2 shadow-inner" onClick={e => e.stopPropagation()}>
      <div className="flex gap-1 mb-2">
        {(Object.keys(GROUPS) as KeyboardGroup[]).map(name => (
          <button
            key={name}
            type="button"
            onClick={() => onGroupChange(name)}
            className={`flex-1 rounded-lg px-1 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors ${
              group === name ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="grid max-h-28 grid-cols-8 gap-1 overflow-y-auto pr-0.5 sm:max-h-32 sm:grid-cols-10">
        {GROUPS[group].map(symbol => (
          <button
            key={symbol}
            type="button"
            onClick={() => insert(symbol)}
            aria-label={`Insert ${symbol.replace(/^◌/, '')}`}
            className="ipa-font min-h-8 rounded-lg border border-slate-100 bg-slate-50 px-1 text-lg text-slate-700 transition-colors hover:border-primary hover:bg-primary/10 active:scale-95"
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
};
