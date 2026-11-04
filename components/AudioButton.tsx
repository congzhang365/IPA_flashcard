import React, { useId, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { IPACardData } from '../types';
import { hasBundledAudio, playIPASound } from '../services/audioService';

export const AudioButton: React.FC<{ data: IPACardData; folded?: boolean }> = ({ data, folded = false }) => {
  const noteId = useId();
  const [failed, setFailed] = useState(false);
  const available = data.category !== 'diacritic' && hasBundledAudio(data.id);
  return (
    <div className="flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
      <button type="button" disabled={!available}
        aria-label={available ? `Play audio for ${data.symbol}` : 'Audio not currently available.'}
        aria-describedby={!available || failed ? noteId : undefined}
        onClick={async e => { e.stopPropagation(); setFailed(!(await playIPASound(data.id, data.symbol))); }}
        className={!available
          ? `${folded ? 'p-6' : 'p-8'} rounded-full bg-slate-100 text-slate-400 cursor-not-allowed`
          : folded
            ? 'p-6 bg-primary rounded-full text-white shadow-lg hover:bg-primary/90 transition-colors'
            : 'p-8 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors'}>
        <Volume2 className={folded ? 'h-10 w-10' : 'h-16 w-16'} />
      </button>
      {(!available || failed) && <p id={noteId} role={failed ? 'status' : undefined}
        className="max-w-[240px] text-center text-xs leading-relaxed text-slate-500">
        {!available ? 'Audio not currently available.' : 'Audio could not play. Please try again.'}
      </p>}
    </div>
  );
};
