
import React from 'react';
import { IPAFeature, AppSettings, StudyMode } from '../types';
import { X, Check, EyeOff, Eye, RotateCcw, Download } from 'lucide-react';

interface SettingsOverlayProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onClose: () => void;
  onReset: () => void;
  onInstall?: () => void;
  selectedCategory: 'all' | 'consonant' | 'vowel' | 'diacritic';
  setSelectedCategory: (cat: 'all' | 'consonant' | 'vowel' | 'diacritic') => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ 
  settings, onUpdate, onClose, onReset, onInstall, selectedCategory, setSelectedCategory 
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">STUDY SETUP</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="space-y-8">
          {onInstall && (
            <button 
              onClick={onInstall}
              className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-secondary/20 border-2 border-secondary/20 animate-pulse"
            >
              <Download className="w-5 h-5" /> INSTALL TO HOME SCREEN
            </button>
          )}

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Study Mode</h3>
            <div className="grid grid-cols-2 gap-4">
              {(['FLASHCARD', 'QUIZ'] as StudyMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-3 rounded-2xl font-bold transition-all border-2 ${
                    settings.mode === m 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Practice Category</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['all', 'consonant', 'vowel', 'diacritic'] as const).map((cat) => {
                const isActive = selectedCategory === cat;
                let displayName = 'All IPA';
                let icon = '🌐';
                if (cat === 'consonant') { displayName = 'Consonants'; icon = '💬'; }
                if (cat === 'vowel') { displayName = 'Vowels'; icon = '🗣️'; }
                if (cat === 'diacritic') { displayName = 'Diacritics'; icon = '✍️'; }
                
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                    }}
                    className={`p-3 rounded-2xl font-bold transition-all border-2 flex items-center justify-between text-xs sm:text-sm ${
                      isActive 
                        ? 'bg-primary/10 border-primary text-primary font-black shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <span>{displayName}</span>
                    </span>
                    {isActive && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Features in Card</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(IPAFeature).map((feature) => {
                const isActive = settings.activeFeatures.includes(feature);
                return (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                      isActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white border-slate-50 text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-sm">{feature}</span>
                    {isActive && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <section>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Eye className="w-3 h-3 text-primary" /> Prompt
              </h3>
              <div className="flex flex-col gap-2">
                {settings.activeFeatures.map((f) => (
                  <button
                    key={f}
                    onClick={() => setPrompt(f)}
                    className={`p-2 rounded-xl border-2 text-xs font-bold transition-all ${
                      settings.promptFeature === f ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white border-slate-50 text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <EyeOff className="w-3 h-3 text-secondary" /> Answer
              </h3>
              <div className="flex flex-col gap-2">
                {settings.activeFeatures
                  .filter(f => f !== IPAFeature.SOUND)
                  .map((f) => (
                  <button
                    key={f}
                    onClick={() => setMasked(f)}
                    className={`p-2 rounded-xl border-2 text-xs font-bold transition-all ${
                      settings.maskedFeature === f ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-white border-slate-50 text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="pt-4 border-t border-slate-50 flex flex-col gap-4">
            <button 
              onClick={onReset}
              className="w-full py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <RotateCcw className="w-4 h-4" /> RESET ALL PROGRESS
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              START STUDYING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
