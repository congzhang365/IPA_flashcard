
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IPAFeature, AppSettings, CardState, LearningStatus } from './types';
import { ipaDataset } from './data/ipaData';
import { Flashcard } from './components/Flashcard';
import { FoldedCard } from './components/FoldedCard';
import { SettingsOverlay } from './components/SettingsOverlay';
import { Settings, Layers, Microscope, Music, MoveHorizontal, RotateCcw, ChevronLeft, ChevronRight, BookOpen, CheckCircle2, Sliders, Construction, Smartphone, Share, PlusSquare, Eye } from 'lucide-react';
// Audio service is used in components, no direct import needed here

const IPAAppCredits: React.FC = () => (
  <div className="mt-4 mb-1 text-center w-full">
    <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400/85">
      © 2026 <a href="https://congzhang-linguist.github.io/" target="_blank" rel="noopener noreferrer" style={{ color: '#00A5A9' }} className="hover:underline font-bold">Cong Zhang</a> @ Newcastle University
    </span>
  </div>
);

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    activeFeatures: [IPAFeature.SYMBOL, IPAFeature.LABEL],
    promptFeature: IPAFeature.SYMBOL,
    maskedFeature: IPAFeature.LABEL,
    mode: 'FLASHCARD'
  });

  const [learnedMap, setLearnedMap] = useState<Record<string, LearningStatus>>(() => {
    const saved = localStorage.getItem('learned_map');
    return saved ? JSON.parse(saved) : {};
  });

  const [studyQueue, setStudyQueue] = useState<string[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [cardState, setCardState] = useState<CardState>({
    currentQueueIndex: 0,
    isFlipped: false,
    userInput: '',
    feedback: 'none'
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'study' | 'lab' | 'tutorial'>('study');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'consonant' | 'vowel' | 'diacritic'>('all');
  
  const [installTab, setInstallTab] = useState<'ios' | 'android'>('ios');
  const installTouchStart = useRef<number | null>(null);
  const installTouchEnd = useRef<number | null>(null);

  const onInstallTouchStart = (e: React.TouchEvent) => {
    installTouchEnd.current = null;
    installTouchStart.current = e.targetTouches[0].clientX;
  };

  const onInstallTouchMove = (e: React.TouchEvent) => {
    installTouchEnd.current = e.targetTouches[0].clientX;
  };

  const onInstallTouchEnd = () => {
    if (!installTouchStart.current || !installTouchEnd.current) return;
    const distance = installTouchStart.current - installTouchEnd.current;
    if (distance > 50) {
      triggerHaptic('light');
      setInstallTab('android');
    } else if (distance < -50) {
      triggerHaptic('light');
      setInstallTab('ios');
    }
  };
  
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const triggerHaptic = (style: 'light' | 'medium' | 'success' | 'error' = 'light') => {
    if ('vibrate' in navigator) {
      if (style === 'success') navigator.vibrate([10, 30, 10]);
      else if (style === 'error') navigator.vibrate([50, 50, 50]);
      else navigator.vibrate(10);
    }
  };

  // Handle Android Back Button
  useEffect(() => {
    const handlePopState = (_event: PopStateEvent) => {
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        window.history.pushState({ noBackExitsApp: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    if (!window.history.state?.noBackExitsApp) {
      window.history.pushState({ noBackExitsApp: true }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSettingsOpen]);

  // Handle PWA Installation
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Initialize queue only on mount or when category changes
  useEffect(() => {
    const freshQueue = ipaDataset
      .filter(card => {
        const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
        const notRemembered = learnedMap[card.id] !== LearningStatus.REMEMBERED;
        return matchesCategory && notRemembered;
      })
      .map(card => card.id);
    
    if (freshQueue.length > 0) {
      // Shuffle the queue initially or when category switches
      freshQueue.sort(() => Math.random() - 0.5);
      setStudyQueue(freshQueue);
    } else {
      setStudyQueue([]);
    }
    setCardState({ currentQueueIndex: 0, isFlipped: false, userInput: '', feedback: 'none' });
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('learned_map', JSON.stringify(learnedMap));
  }, [learnedMap]);

  const handleNext = useCallback(() => {
    if (studyQueue.length === 0) return;
    triggerHaptic();
    
    if (cardState.isFlipped) {
      setCardState(prev => ({ ...prev, isFlipped: false }));
      setTimeout(() => {
        setCardState(prev => ({
          ...prev,
          currentQueueIndex: (prev.currentQueueIndex + 1) % studyQueue.length,
          userInput: '',
          feedback: 'none'
        }));
      }, 310);
    } else {
      setCardState(prev => ({
        ...prev,
        currentQueueIndex: (prev.currentQueueIndex + 1) % studyQueue.length,
        userInput: '',
        feedback: 'none'
      }));
    }
  }, [studyQueue, cardState.isFlipped]);

  const handlePrev = useCallback(() => {
    if (studyQueue.length === 0) return;
    triggerHaptic();
    
    if (cardState.isFlipped) {
      setCardState(prev => ({ ...prev, isFlipped: false }));
      setTimeout(() => {
        setCardState(prev => ({
          ...prev,
          currentQueueIndex: (prev.currentQueueIndex - 1 + studyQueue.length) % studyQueue.length,
          userInput: '',
          feedback: 'none'
        }));
      }, 310);
    } else {
      setCardState(prev => ({
        ...prev,
        currentQueueIndex: (prev.currentQueueIndex - 1 + studyQueue.length) % studyQueue.length,
        userInput: '',
        feedback: 'none'
      }));
    }
  }, [studyQueue, cardState.isFlipped]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
  };

  const currentCardId = studyQueue[cardState.currentQueueIndex];
  const currentCard = ipaDataset.find(c => c.id === currentCardId);

  const removeCardFromQueue = (cardId: string) => {
    setStudyQueue(prevQueue => {
      const nextQueue = prevQueue.filter(id => id !== cardId);
      setCardState(prev => {
        let nextIndex = prev.currentQueueIndex;
        if (nextIndex >= nextQueue.length) {
          nextIndex = 0;
        }
        return {
          ...prev,
          currentQueueIndex: nextIndex,
          isFlipped: false,
          userInput: '',
          feedback: 'none'
        };
      });
      return nextQueue;
    });
  };

  const handleMarkStatus = (status: LearningStatus) => {
    if (!currentCard) return;
    triggerHaptic(status === LearningStatus.REMEMBERED ? 'success' : 'medium');
    if (status === LearningStatus.REMEMBERED) {
      const cardId = currentCard.id;
      setLearnedMap(prev => ({ ...prev, [cardId]: LearningStatus.REMEMBERED }));
      
      if (cardState.isFlipped) {
        setCardState(prev => ({ ...prev, isFlipped: false }));
        setTimeout(() => {
          removeCardFromQueue(cardId);
        }, 310);
      } else {
        removeCardFromQueue(cardId);
      }
    } else {
      handleNext();
    }
  };

  const handleQuizSubmit = (input: string) => {
    if (!currentCard) return;
    const targetFeature = settings.maskedFeature;
    let isCorrect = false;

    const sanitizedInput = input.toLowerCase().trim();
    if (!sanitizedInput) {
      isCorrect = false;
    } else if (targetFeature === IPAFeature.SYMBOL) {
      isCorrect = sanitizedInput === currentCard.symbol.toLowerCase();
    } else if (targetFeature === IPAFeature.LABEL) {
      isCorrect = currentCard.label.toLowerCase().includes(sanitizedInput);
    } else if (targetFeature === IPAFeature.EXAMPLES) {
      isCorrect = currentCard.words ? currentCard.words.some(w => w.toLowerCase() === sanitizedInput) : false;
    }

    if (isCorrect) {
      triggerHaptic('success');
      setCardState(prev => ({ ...prev, feedback: 'correct', isFlipped: true }));
      // Wait 1200ms to allow user to see the congrats, then remove card and transit cleanly after flipping back
      setTimeout(() => {
        setCardState(prev => ({ ...prev, isFlipped: false }));
        setTimeout(() => {
          const cardId = currentCard.id;
          setLearnedMap(prev => ({ ...prev, [cardId]: LearningStatus.REMEMBERED }));
          removeCardFromQueue(cardId);
        }, 310);
      }, 1200);
    } else {
      triggerHaptic('error');
      setCardState(prev => ({ ...prev, feedback: 'incorrect', isFlipped: true }));
      // Push incorrect card to the end of the queue for review
      setStudyQueue(prev => {
        if (prev[prev.length - 1] !== currentCard.id) {
          return [...prev, currentCard.id];
        }
        return prev;
      });
    }
  };

  const resetAll = () => {
    setLearnedMap({});
    localStorage.removeItem('learned_map');
    
    // Explicitly reset the queue for current category
    const freshQueue = ipaDataset
      .filter(card => selectedCategory === 'all' || card.category === selectedCategory)
      .map(card => card.id);
      
    if (freshQueue.length > 0) {
      freshQueue.sort(() => Math.random() - 0.5);
      setStudyQueue(freshQueue);
    } else {
      setStudyQueue([]);
    }
    
    setCardState({
      currentQueueIndex: 0,
      isFlipped: false,
      userInput: '',
      feedback: 'none'
    });
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between pb-28 pt-4 px-4 max-w-md mx-auto relative select-none bg-[#fcfdfd]">
      
      <header className="w-full flex justify-between items-center mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">IPA Flashcard</h1>
        </div>
        <button 
          onClick={() => { triggerHaptic(); setIsSettingsOpen(true); }}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-primary transition-all hover:shadow-md active:scale-90"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {activeTab === 'study' && (
        <div className="w-full px-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Focus Category
            </span>
            <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {selectedCategory === 'all' ? 'All IPA' : selectedCategory + 's'}
            </span>
          </div>
          <div className="bg-slate-100 p-1 rounded-full flex gap-1 border border-slate-200/40 relative">
            {(['all', 'consonant', 'vowel', 'diacritic'] as const).map((cat) => {
              const isActive = selectedCategory === cat;
              let displayName = 'All';
              if (cat === 'consonant') displayName = 'Consonants';
              if (cat === 'vowel') displayName = 'Vowels';
              if (cat === 'diacritic') displayName = 'Diacritics';
              
              return (
                <button
                  key={cat}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory(cat);
                  }}
                  className={`flex-1 py-2 rounded-full transition-all duration-300 text-[10px] font-bold uppercase tracking-wider relative ${
                    isActive
                      ? 'bg-primary text-white shadow-sm font-black scale-[1.02] z-10'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'study' ? (
        <main className="w-full flex-grow flex flex-col items-center justify-center gap-4 overflow-visible">
          {studyQueue.length > 0 && currentCard ? (
            <div className="w-full relative flex flex-col items-center gap-4">
              <div 
                className="w-full flex justify-center h-[390px] relative group"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {settings.activeFeatures.length === 2 ? (
                  <Flashcard 
                    key={currentCard.id}
                    data={currentCard}
                    promptFeature={settings.promptFeature}
                    maskedFeature={settings.maskedFeature}
                    isFlipped={cardState.isFlipped}
                    onFlip={() => { triggerHaptic(); setCardState(p => ({ ...p, isFlipped: !p.isFlipped })); }}
                    isQuiz={settings.mode === 'QUIZ'}
                    userInput={cardState.userInput}
                    setUserInput={(v) => setCardState(p => ({ ...p, userInput: v }))}
                    feedback={cardState.feedback}
                    onSubmit={handleQuizSubmit}
                    onMarkStatus={settings.mode === 'FLASHCARD' ? handleMarkStatus : undefined}
                  />
                ) : (
                  <FoldedCard 
                    key={currentCard.id}
                    data={currentCard}
                    promptFeature={settings.promptFeature}
                    maskedFeature={settings.maskedFeature}
                    features={settings.activeFeatures}
                    isQuiz={settings.mode === 'QUIZ'}
                    userInput={cardState.userInput}
                    setUserInput={(v) => setCardState(p => ({ ...p, userInput: v }))}
                    feedback={cardState.feedback}
                    onSubmit={handleQuizSubmit}
                    onMarkStatus={settings.mode === 'FLASHCARD' ? handleMarkStatus : undefined}
                  />
                )}
              </div>

              <div className="flex items-center justify-center gap-8 w-full mt-4">
                <button 
                  onClick={handlePrev}
                  className="p-4 bg-white rounded-full shadow-lg border border-slate-100 text-slate-400 hover:text-primary transition-all active:scale-90"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <div className="text-slate-400 font-black text-lg tracking-tighter bg-white px-6 py-2 rounded-full shadow-sm border border-slate-50 min-w-[100px] text-center">
                  {cardState.currentQueueIndex + 1} <span className="opacity-20 mx-1">/</span> {studyQueue.length}
                </div>
                <button 
                  onClick={handleNext}
                  className="p-4 bg-white rounded-full shadow-lg border border-slate-100 text-slate-400 hover:text-primary transition-all active:scale-90"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2 opacity-50">
                <MoveHorizontal className="w-3 h-3" />
                Swipe or use arrows
              </div>
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-[3rem] shadow-xl border border-slate-100 w-full animate-in fade-in zoom-in">
              <RotateCcw className="w-16 h-16 text-primary mx-auto mb-6 animate-spin-slow" />
              <h2 className="text-2xl font-black text-slate-800 mb-2">Queue Clear!</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">You've mastered all cards in this session. Great job!</p>
              <button 
                onClick={resetAll}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                RESET PROGRESS
              </button>
            </div>
          )}
          <IPAAppCredits />
        </main>
       ) : activeTab === 'lab' ? (
        <main className="w-full flex-grow flex flex-col items-center justify-center py-8 gap-8 animate-in fade-in duration-300 px-4">
          <div className="bg-white p-10 rounded-[3rem] w-full border border-slate-100 shadow-2xl shadow-slate-200 flex flex-col items-center text-center relative overflow-hidden">
            {/* Maintenance/Coming Soon Banner */}
            <div className="absolute top-6 -right-12 bg-secondary text-white font-black text-[10px] py-2 px-12 rotate-45 shadow-lg tracking-widest">
              COMING SOON
            </div>
            
            <div className="bg-slate-50 p-6 rounded-full mb-8 border border-slate-100 shadow-inner">
              <Construction className="w-16 h-16 text-slate-300 animate-pulse" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">IPA LAB</h2>
            <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-[240px]">
              Advanced phonetic synthesis is currently under development. Soon you'll be able to hear any IPA combination.
            </p>

            <div className="w-full bg-slate-50 p-6 rounded-3xl shadow-inner border border-slate-100 mb-8 opacity-40 select-none pointer-events-none">
              <div className="w-full h-12 flex items-center justify-center text-2xl font-bold text-slate-200 ipa-font italic">
                ðɪs ɪz ðə fjuːtʃə
              </div>
            </div>

            <button 
              disabled
              className="w-full py-5 bg-slate-100 text-slate-300 rounded-2xl font-black flex items-center justify-center gap-3 cursor-not-allowed border border-slate-200"
            >
              <Music className="w-5 h-5 opacity-50" />
              NOT AVAILABLE YET
            </button>
            
            <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Check back for version 2.0
            </p>
          </div>
          <IPAAppCredits />
        </main>
      ) : (
        <main className="w-full flex-grow flex flex-col items-center justify-start py-6 gap-5 animate-in fade-in slide-in-from-right duration-300 overflow-y-auto pb-8 scrollbar-hide">
          <div className="w-full flex items-center gap-3 mb-1 px-2">
            <div className="bg-secondary/10 p-2.5 rounded-2xl animate-pulse">
              <BookOpen className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">How to Study</h2>
          </div>

          {/* Device Specific Swipeable Installation Guides */}
          <div className="w-full bg-white p-5 rounded-[1.75rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col gap-4">
            <div className="flex p-0.5 bg-slate-50 border border-slate-100 rounded-xl gap-1">
              <button 
                onClick={() => { triggerHaptic(); setInstallTab('ios'); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${installTab === 'ios' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
              >
                 iOS (iPhone)
              </button>
              <button 
                onClick={() => { triggerHaptic(); setInstallTab('android'); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${installTab === 'android' ? 'bg-white shadow-sm text-slate-800 font-bold' : 'text-slate-400'}`}
              >
                🤖 Android
              </button>
            </div>

            <div 
              onTouchStart={onInstallTouchStart}
              onTouchMove={onInstallTouchMove}
              onTouchEnd={onInstallTouchEnd}
              className="relative overflow-hidden min-h-[145px] flex flex-col justify-center transition-all duration-300 px-1"
            >
              {installTab === 'ios' ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 w-full">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="bg-slate-900 p-1.5 rounded-lg">
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 tracking-tight">Add to Safari Homescreen</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">1</div>
                      <p className="text-xs text-slate-500 leading-relaxed">Launch the app in your iPhone's <span className="text-slate-800 font-semibold">Safari</span> browser.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">2</div>
                      <p className="text-xs text-slate-500 leading-relaxed flex items-center gap-1 flex-wrap">Tap the blue <Share className="w-3.5 h-3.5 text-blue-500 inline" /> <span className="text-slate-800 font-semibold">Share</span> icon in the navigation bar.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">3</div>
                      <p className="text-xs text-slate-500 leading-relaxed flex items-center gap-1 flex-wrap">Choose <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" /> <span className="text-slate-800 font-semibold">Add to Home Screen</span> to run offline.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 w-full">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="bg-primary/25 p-1.5 rounded-lg">
                      <Smartphone className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 tracking-tight">Add to Android Chrome Homescreen</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">1</div>
                      <p className="text-xs text-slate-500 leading-relaxed">Launch the app using your Android's <span className="text-slate-800 font-semibold">Chrome</span> browser.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">2</div>
                      <p className="text-xs text-slate-500 leading-relaxed">Tap the <span className="text-slate-800 font-semibold">menu button (three stacked dots ⋮)</span>.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">3</div>
                      <p className="text-xs text-slate-500 leading-relaxed">Select <span className="text-primary font-bold">Install app</span> or <span className="text-primary font-bold">Add to Home screen</span>.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Slider Dots */}
            <div className="flex justify-center gap-1.5">
              <button 
                onClick={() => { triggerHaptic(); setInstallTab('ios'); }} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${installTab === 'ios' ? 'w-4 bg-primary' : 'bg-slate-200'}`} 
              />
              <button 
                onClick={() => { triggerHaptic(); setInstallTab('android'); }} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${installTab === 'android' ? 'w-4 bg-primary' : 'bg-slate-200'}`} 
              />
            </div>
          </div>

          {/* Active Features Info Card */}
          <section className="w-full bg-white p-5 rounded-[1.75rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/5 p-1.5 rounded-lg">
                <Sliders className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Active Features & Layouts</h3>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed space-y-2">
              <p>
                Configure card contents using the <span className="font-bold text-slate-700">Study Setup</span> gear icon:
              </p>
              <ul className="space-y-1.5 pl-1.5 border-l-2 border-primary/20">
                <li>
                  <span className="font-bold text-slate-700">• At Least 2 Selected:</span> You must toggle on at least 2 active features. When only two are selected, they cannot be deselected to prevent cards from breaking.
                </li>
                <li>
                  <span className="font-bold text-slate-700">• Exactly 2 = Classic Flip:</span> Cards act as standard double-sided flashcards. Tap anywhere on the card to flip between Prompt and Answer.
                </li>
                <li>
                  <span className="font-bold text-slate-700">• 3 or More = Multi-Tab Folds:</span> Cards become premium multi-perspective cards. Tap any of the sleek index tabs at the card base or swipe left/right to change perspective.
                </li>
              </ul>
            </div>
          </section>

          {/* Choosing Prompt & Answer */}
          <section className="w-full bg-white p-5 rounded-[1.75rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#7CB5B8]/10 p-1.5 rounded-lg">
                <Eye className="w-4 h-4 text-secondary" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Question Flow Selection</h3>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed space-y-1.5">
              <p>
                Define your exact prompt direction in the <span className="font-bold text-slate-700">Study Setup</span>:
              </p>
              <ul className="space-y-1 pl-1.5 border-l-2 border-secondary/20">
                <li>
                  • <span className="font-bold text-slate-700">Prompt:</span> Choose the face presented first (e.g., studying visually with the raw phonetic <span className="font-semibold">Symbol</span>).
                </li>
                <li>
                  • <span className="font-bold text-slate-700">Answer:</span> Choose the final target verification item (e.g., reciting the correct phonetic description <span className="font-semibold">Label</span> or key <span className="font-semibold">Example</span> word). Audio playback is dedicated to output only.
                </li>
              </ul>
            </div>
          </section>

          {/* Mastery Progress Card */}
          <section className="w-full bg-white p-5 rounded-[1.75rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-50 p-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Grading & History Archive</h3>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed space-y-2">
              <p>Assess your phonetic memory on card review by selecting your feedback level:</p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold mt-1">
                <div className="bg-emerald-50/70 border border-emerald-105 text-emerald-600 rounded-lg py-1.5 flex flex-col justify-between">
                  <span>Yes</span>
                  <span className="block text-[8px] font-normal lowercase text-emerald-500 mt-1">Archived From Deck</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-105 text-amber-600 rounded-lg py-1.5 flex flex-col justify-between">
                  <span>Maybe</span>
                  <span className="block text-[8px] font-normal lowercase text-amber-500 mt-1">Kept in Deck</span>
                </div>
                <div className="bg-rose-50/70 border border-rose-105 text-rose-500 rounded-lg py-1.5 flex flex-col justify-between">
                  <span>No</span>
                  <span className="block text-[8px] font-normal lowercase text-rose-500 mt-1">Shuffled back</span>
                </div>
              </div>
            </div>
          </section>

          {/* Reset Progress Card */}
          <section className="w-full bg-white p-5 rounded-[1.75rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-rose-50 p-1.5 rounded-lg">
                <RotateCcw className="w-4 h-4 text-rose-400" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Resetting Progress</h3>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed pr-1">
              <p>
                To restart your entire learning sessions, open the Study Setup options and choose <span className="font-bold text-rose-500">Reset Progress</span>. This clears your memory history, retrieves all mastered cards, and builds a fully shuffled new deck.
              </p>
            </div>
          </section>
          <IPAAppCredits />
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,20px)] pt-4 bg-slate-900/95 backdrop-blur-xl flex justify-center items-center shadow-2xl z-40 border-t border-white/10">
        <div className="flex justify-around w-full max-w-sm px-6">
          <button 
            onClick={() => { triggerHaptic(); setActiveTab('study'); }}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'study' ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Layers className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Study</span>
          </button>
          
          <button 
            onClick={() => { triggerHaptic(); setActiveTab('tutorial'); }}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'tutorial' ? 'text-secondary scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Tutorial</span>
          </button>

          <button 
            onClick={() => { triggerHaptic(); setActiveTab('lab'); }}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'lab' ? 'text-slate-200 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Microscope className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Lab</span>
          </button>
        </div>
      </nav>

      {isSettingsOpen && (
        <SettingsOverlay 
          settings={settings}
          onUpdate={setSettings}
          onClose={() => setIsSettingsOpen(false)}
          onReset={resetAll}
          onInstall={deferredPrompt ? handleInstallClick : undefined}
        />
      )}
    </div>
  );
};

export default App;
