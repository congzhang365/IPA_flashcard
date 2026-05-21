import React, { useState, useEffect } from 'react';
import { IPAFeature, IPACardData, LearningStatus } from '../types';
import { Volume2, ChevronRight, ChevronLeft, CheckCircle, XCircle, Check, X, HelpCircle } from 'lucide-react';
import { playIPASound } from '../services/audioService';

interface FoldedCardProps {
  data: IPACardData;
  promptFeature: IPAFeature;
  maskedFeature: IPAFeature;
  features: IPAFeature[];
  isQuiz?: boolean;
  userInput: string;
  setUserInput: (val: string) => void;
  feedback: 'none' | 'correct' | 'incorrect';
  onSubmit: (val: string) => void;
  onMarkStatus?: (status: LearningStatus) => void;
}

const FeatureIcon: React.FC<{ feature: IPAFeature }> = ({ feature }) => {
  switch (feature) {
    case IPAFeature.SYMBOL: return <span className="text-lg font-bold">Ω</span>;
    case IPAFeature.LABEL: return <span className="text-lg font-bold">abc</span>;
    case IPAFeature.WORDS: return <span className="text-lg font-bold">""</span>;
    case IPAFeature.SOUND: return <Volume2 className="w-5 h-5" />;
    default: return null;
  }
};

const FeatureDisplay: React.FC<{ feature: IPAFeature; data: IPACardData }> = ({ feature, data }) => {
  switch (feature) {
    case IPAFeature.SYMBOL:
      return <div className="ipa-font text-7xl font-bold text-slate-800">{data.symbol}</div>;
    case IPAFeature.LABEL:
      return <div className="text-xl font-semibold text-slate-700 text-center px-4 leading-relaxed">{data.label}</div>;
    case IPAFeature.WORDS:
      return (
        <div className="flex flex-wrap justify-center gap-3 px-4">
          {data.words && data.words.length > 0 ? (
            data.words.map((w, i) => (
              <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-slate-600 text-sm font-medium">{w}</span>
            ))
          ) : (
            <span className="text-slate-400 italic text-sm">No examples available</span>
          )}
        </div>
      );
    case IPAFeature.SOUND:
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); playIPASound(data.id, data.symbol); }}
          className="p-6 bg-primary rounded-full text-white shadow-lg hover:bg-primary/90 transition-all active:scale-95"
        >
          <Volume2 className="w-10 h-10" />
        </button>
      );
    default: return null;
  }
};

export const FoldedCard: React.FC<FoldedCardProps> = ({ 
  data, promptFeature, maskedFeature, features, isQuiz, userInput, setUserInput, feedback, onSubmit, onMarkStatus 
}) => {
  const [activeSurface, setActiveSurface] = useState(0);

  useEffect(() => {
    // Start at the prompt feature
    const promptIdx = features.indexOf(promptFeature);
    if (promptIdx !== -1) setActiveSurface(promptIdx);
  }, [promptFeature, features]);

  const nextSurface = () => setActiveSurface((s) => (s + 1) % features.length);
  const prevSurface = () => setActiveSurface((s) => (s - 1 + features.length) % features.length);

  // Surface is masked only if it's the target and no feedback has been given yet
  const isCurrentSurfaceMasked = isQuiz && features[activeSurface] === maskedFeature && feedback === 'none';

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(userInput);
  };

  return (
    <div 
      className="w-full max-w-sm h-[390px] relative flex flex-col items-center justify-center bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden cursor-pointer group"
      onClick={nextSurface}
    >
      {/* Visual fold effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 -rotate-45 translate-x-12 -translate-y-12 shadow-sm border-b border-slate-200 z-10"></div>
      
      {/* Navigation Indicators */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {features.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${i === activeSurface ? 'w-8 bg-primary shadow-sm shadow-primary/40' : 'w-2 bg-slate-100'}`}
          />
        ))}
      </div>

      <div className="flex flex-col items-center justify-center p-8 text-center w-full min-h-[300px]" key={activeSurface}>
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
          <FeatureIcon feature={features[activeSurface]} />
          {features[activeSurface]}
        </div>
        
        {isCurrentSurfaceMasked ? (
          <div className="w-full max-w-[240px] animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Identify this sound</h3>
             <form onSubmit={handleQuizSubmit} className="flex flex-col gap-3">
               <input
                autoFocus
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none text-center text-xl font-bold bg-slate-50 shadow-inner"
                placeholder="..."
              />
              <button 
                type="submit"
                className="bg-primary text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                SUBMIT GUESS
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center w-full">
            {isQuiz && features[activeSurface] === maskedFeature && feedback !== 'none' && (
              <div className="mb-6 animate-bounce">
                {feedback === 'correct' ? 
                  <div className="flex items-center gap-2 text-green-500 font-black text-xs tracking-widest"><CheckCircle className="w-5 h-5" /> EXCELLENT</div> : 
                  <div className="flex items-center gap-2 text-red-500 font-black text-xs tracking-widest"><XCircle className="w-5 h-5" /> REVISE THIS</div>
                }
              </div>
            )}
            
            <FeatureDisplay feature={features[activeSurface]} data={data} />
            
            {onMarkStatus && (feedback !== 'none' || !isQuiz) && (
              <div className="flex gap-4 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => onMarkStatus(LearningStatus.NO)} 
                  className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all active:scale-90 shadow-sm"
                >
                  <X className="w-6 h-6"/>
                </button>
                <button 
                  onClick={() => onMarkStatus(LearningStatus.MAYBE)} 
                  className="p-4 bg-secondary/10 text-secondary rounded-2xl hover:bg-secondary/20 transition-all active:scale-90 shadow-sm"
                >
                  <HelpCircle className="w-6 h-6"/>
                </button>
                <button 
                  onClick={() => onMarkStatus(LearningStatus.REMEMBERED)} 
                  className="p-4 bg-green-50 text-green-500 rounded-2xl hover:bg-green-100 transition-all active:scale-90 shadow-sm"
                >
                  <Check className="w-6 h-6"/>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Surface Cycle Controls */}
      <button 
        onClick={(e) => { e.stopPropagation(); prevSurface(); }} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-slate-100 hover:text-primary transition-all active:scale-75 z-20 bg-white/50 backdrop-blur-sm rounded-full border border-slate-50 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); nextSurface(); }} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-slate-100 hover:text-primary transition-all active:scale-75 z-20 bg-white/50 backdrop-blur-sm rounded-full border border-slate-50 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Surface Navigation Tab Bar */}
      <div className="absolute bottom-0 inset-x-0 h-14 flex border-t border-slate-50">
        {features.map((feature, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setActiveSurface(i); }}
            className={`flex-1 flex items-center justify-center transition-all ${
              i === activeSurface 
                ? 'bg-slate-50 text-primary border-t-2 border-primary font-black scale-105' 
                : 'bg-white text-slate-300 hover:text-slate-400'
            }`}
          >
            <FeatureIcon feature={feature} />
          </button>
        ))}
      </div>
    </div>
  );
};