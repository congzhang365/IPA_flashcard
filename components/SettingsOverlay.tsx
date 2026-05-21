
import React from 'react';
import { IPAFeature, AppSettings, StudyMode } from '../types';
import { X, Check, EyeOff, Eye, RotateCcw, Download } from 'lucide-react';

interface SettingsOverlayProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onClose: () => void;
  onReset: () => void;
  onInstall?: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ 
  settings, onUpdate, onClose, onReset, onInstall 
}) => {
  const toggleFeature = (feature: IPAFeature) => {
    let newFeatures = [...settings.activeFeatures];
    if (newFeatures.includes(feature)) {
      if (newFeatures.length > 2) {
        newFeatures = newFeatures.filter(f => f !== feature);
      }
    } else {
      newFeatures.push(feature);
    }
    
    let nextPrompt = settings.promptFeature;
    let nextMasked = settings.maskedFeature;

    if (!newFeatures.includes(nextPrompt)) {
      nextPrompt = newFeatures[0];
    }
    
    if (!newFeatures.includes(nextMasked) || nextMasked === IPAFeature.SOUND) {
      nextMasked = newFeatures.find(f => f !== IPAFeature.SOUND && f !== nextPrompt) || newFeatures.find(f => f !== IPAFeature.SOUND) || newFeatures[0];
    }

    onUpdate({ ...settings, activeFeatures: newFeatures, promptFeature: nextPrompt, maskedFeature: nextMasked });
  };

  const setMode = (mode: StudyMode) => {
    onUpdate({ ...settings, mode });
  };

  const setPrompt = (f: IPAFeature) => {
    let nextMasked = settings.maskedFeature;
    if (f === nextMasked) {
      nextMasked = settings.activeFeatures.find(feat => feat !== f && feat !== IPAFeature.SOUND) || settings.activeFeatures[0];
    }
    onUpdate({ ...settings, promptFeature: f, maskedFeature: nextMasked });
  };

  const setMasked = (f: IPAFeature) => {
    if (f === IPAFeature.SOUND) return; 
    let nextPrompt = settings.promptFeature;
    if (f === nextPrompt) {
      nextPrompt = settings.activeFeatures.find(feat => feat !== f) || settings.activeFeatures[0];
    }
    onUpdate({ ...settings, maskedFeature: f, promptFeature: nextPrompt });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-800 tracking-wider uppercase">Study Setup</h2>
          <button onClick={onClose} className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {onInstall && (
            <button 
              onClick={onInstall}
              className="w-full py-3 bg-secondary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" /> Install to Home Screen
            </button>
          )}

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Study Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['FLASHCARD', 'QUIZ'] as StudyMode[]).map((m) => ( m === 'FLASHCARD' ? (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                    settings.mode === m 
                      ? 'bg-primary border-primary text-white shadow-md shadow-primary/15' 
                      : 'bg-slate-50/60 border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  Flashcard
                </button>
              ) : (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                    settings.mode === m 
                      ? 'bg-primary border-primary text-white shadow-md shadow-primary/15' 
                      : 'bg-slate-50/60 border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  Quiz
                </button>
              )))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Features in Card</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(IPAFeature).map((feature) => {
                const isActive = settings.activeFeatures.includes(feature);
                return (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`flex items-center justify-between py-2 px-3 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-primary/5 border-primary/20 text-primary font-bold' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-xs">{feature === IPAFeature.EXAMPLES ? 'EXAMPLES' : feature}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary" /> Prompt
              </h3>
              <div className="flex flex-col gap-1.5">
                {settings.activeFeatures.map((f) => (
                  <button
                    key={f}
                    onClick={() => setPrompt(f)}
                    className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                      settings.promptFeature === f 
                        ? 'bg-primary/5 border-primary/25 text-primary' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {f === IPAFeature.EXAMPLES ? 'E.g.' : f}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-secondary" /> Answer
              </h3>
              <div className="flex flex-col gap-1.5">
                {settings.activeFeatures
                  .filter(f => f !== IPAFeature.SOUND)
                  .map((f) => (
                  <button
                    key={f}
                    onClick={() => setMasked(f)}
                    className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                      settings.maskedFeature === f 
                        ? 'bg-secondary/5 border-secondary/25 text-secondary' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {f === IPAFeature.EXAMPLES ? 'E.g.' : f}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
            <button 
              onClick={onReset}
              className="w-full py-2 bg-rose-50/30 border border-rose-100 text-rose-500/80 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Progress
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all uppercase tracking-wider shadow-md shadow-slate-900/10 active:scale-95"
            >
              Start Studying
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
