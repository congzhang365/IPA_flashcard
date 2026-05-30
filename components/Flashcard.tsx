import React from 'react';
import { IPAFeature, IPACardData, LearningStatus } from '../types';
import { Volume2, CheckCircle, XCircle, HelpCircle, Check, X } from 'lucide-react';
import { playIPASound } from '../services/audioService';

interface FlashcardProps {
  data: IPACardData;
  promptFeature: IPAFeature;
  maskedFeature: IPAFeature;
  isFlipped: boolean;
  onFlip: () => void;
  isQuiz: boolean;
  userInput: string;
  setUserInput: (val: string) => void;
  feedback: 'none' | 'correct' | 'incorrect';
  onSubmit: (val: string) => void;
  onMarkStatus?: (status: LearningStatus) => void;
}

const FeatureContent: React.FC<{ feature: IPAFeature; data: IPACardData }> = ({ feature, data }) => {
  switch (feature) {
    case IPAFeature.SYMBOL:
      return <div className="ipa-font text-8xl font-bold text-slate-800">{data.symbol}</div>;
    case IPAFeature.LABEL:
      return <div className="text-2xl font-semibold text-slate-700 text-center px-4 leading-snug">{data.label}</div>;
    case IPAFeature.EXAMPLES:
      return (
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm uppercase tracking-widest text-slate-400 mb-2 font-bold">Examples</span>
          {data.words && data.words.length > 0 ? (
            data.words.map((w, i) => (
              <span key={i} className="text-xl font-medium text-slate-700 text-center px-4">{w}</span>
            ))
          ) : (
            <span className="text-slate-400 italic text-xs text-center px-4">No examples (diacritic modifier)</span>
          )}
        </div>
      );
    case IPAFeature.SOUND:
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); playIPASound(data.id, data.symbol); }}
          className="p-8 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors group"
        >
          <Volume2 className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
        </button>
      );
    default:
      return null;
  }
};

export const Flashcard: React.FC<FlashcardProps> = ({ 
  data, promptFeature, maskedFeature, isFlipped, onFlip, isQuiz, userInput, setUserInput, feedback, onSubmit, onMarkStatus 
}) => {
  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(userInput);
  };

  return (
    <div className="w-full max-w-sm h-[390px] perspective-1000 cursor-pointer" onClick={onFlip}>
      <div className={`relative w-full h-full transition-transform duration-300 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front */}
        <div className="absolute inset-0 bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center border border-slate-100 backface-hidden p-6">
          <div className="flex-grow flex items-center justify-center w-full">
            <FeatureContent feature={promptFeature} data={data} />
          </div>
          
          {isQuiz && !isFlipped && (
            <div className="w-full mt-4 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identify {maskedFeature === IPAFeature.EXAMPLES ? 'examples' : maskedFeature}</h3>
              <form onSubmit={handleQuizSubmit} className="w-full flex flex-col gap-2">
                <input
                  autoFocus
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary outline-none text-center text-xl font-bold bg-slate-50 shadow-inner"
                  placeholder="???"
                />
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  CHECK ANSWER
                </button>
              </form>
            </div>
          )}

          <div className="absolute top-4 right-6 text-slate-300/80 text-[10px] font-black uppercase tracking-wider">{promptFeature === IPAFeature.EXAMPLES ? 'E.g.' : promptFeature}</div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center border border-slate-100 backface-hidden rotate-y-180 p-6">
          <div className="mb-4">
            {feedback === 'correct' && (
              <div className="text-green-500 flex items-center gap-2 font-black text-xs tracking-widest animate-bounce">
                <CheckCircle className="w-5 h-5" /> CORRECT
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="text-red-500 flex items-center gap-2 font-black text-xs tracking-widest">
                <XCircle className="w-5 h-5" /> INCORRECT
              </div>
            )}
          </div>
          
          <div className="flex-grow flex items-center justify-center w-full">
            <FeatureContent feature={maskedFeature} data={data} />
          </div>

          {onMarkStatus && isFlipped && (
            <div className="flex gap-4 mt-8 w-full justify-center" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => onMarkStatus(LearningStatus.NO)}
                className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all active:scale-90 flex flex-col items-center gap-1 min-w-[70px]"
              >
                <X className="w-6 h-6" />
                <span className="text-[10px] font-black">NO</span>
              </button>
              <button 
                onClick={() => onMarkStatus(LearningStatus.MAYBE)}
                className="p-4 bg-secondary/10 text-secondary rounded-2xl hover:bg-secondary/20 transition-all active:scale-90 flex flex-col items-center gap-1 min-w-[70px]"
              >
                <HelpCircle className="w-6 h-6" />
                <span className="text-[10px] font-black">MAYBE</span>
              </button>
              <button 
                onClick={() => onMarkStatus(LearningStatus.REMEMBERED)}
                className="p-4 bg-green-50 text-green-500 rounded-2xl hover:bg-green-100 transition-all active:scale-90 flex flex-col items-center gap-1 min-w-[70px]"
              >
                <Check className="w-6 h-6" />
                <span className="text-[10px] font-black">YES</span>
              </button>
            </div>
          )}
          
          <div className="absolute top-4 right-6 text-slate-300/80 text-[10px] font-black uppercase tracking-wider">{maskedFeature === IPAFeature.EXAMPLES ? 'E.g.' : maskedFeature}</div>
        </div>

      </div>
    </div>
  );
};