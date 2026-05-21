
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IPAFeature, AppSettings, CardState, LearningStatus } from './types';
import { ipaDataset } from './data/ipaData';
import { Flashcard } from './components/Flashcard';
import { FoldedCard } from './components/FoldedCard';
import { SettingsOverlay } from './components/SettingsOverlay';
import { Settings, Layers, Microscope, Music, MoveHorizontal, RotateCcw, ChevronLeft, ChevronRight, BookOpen, Pointer, CheckCircle2, Sliders, Construction, Download, Smartphone, Share, PlusSquare } from 'lucide-react';
// Audio service is used in components, no direct import needed here

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
    } else if (targetFeature === IPAFeature.WORDS) {
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
          <h1 className="text-xl font-black text-slate-800 tracking-tight">IPA MASTER</h1>
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
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <span>🎯</span> FOCUS CATEGORY
            </span>
            <span className="text-[10px] bg-primary/10 text-primary font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {selectedCategory === 'all' ? 'All IPA' : selectedCategory + 's'}
            </span>
          </div>
          <div className="bg-slate-100/60 p-1.5 rounded-2xl flex gap-1.5 shadow-inner border border-slate-200/30">
            {(['all', 'consonant', 'vowel', 'diacritic'] as const).map((cat) => {
              const isActive = selectedCategory === cat;
              let displayName = 'All';
              let icon = '🌐';
              if (cat === 'consonant') { displayName = 'Consonants'; icon = '💬'; }
              if (cat === 'vowel') { displayName = 'Vowels'; icon = '🗣️'; }
              if (cat === 'diacritic') { displayName = 'Diacritics'; icon = '✍️'; }
              
              return (
                <button
                  key={cat}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory(cat);
                  }}
                  className={`flex-1 py-2 px-0.5 rounded-xl transition-all flex flex-col items-center gap-1 border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-md font-black scale-[1.03] z-10'
                      : 'bg-white text-slate-500 border-slate-100 hover:text-slate-700 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <span className="text-sm sm:text-base">{icon}</span>
                  <span className="tracking-tight text-[10px] font-black">{displayName}</span>
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
              <div className="w-full h-12 flex items-center justify-center text-3xl font-bold text-slate-200 ipa-font italic">
                θɪs ɪz fjuːtʃə
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
        </main>
      ) : (
        <main className="w-full flex-grow flex flex-col items-center justify-start py-8 gap-6 animate-in fade-in slide-in-from-right duration-300 overflow-y-auto pb-8 scrollbar-hide">
          <div className="w-full flex items-center gap-4 mb-2 px-2">
            <div className="bg-secondary/10 p-3 rounded-2xl">
              <BookOpen className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">HOW TO PLAY</h2>
          </div>

          {/* Device Specific Installation Guides */}
          <div className="grid grid-cols-1 gap-4 w-full">
            {/* iPhone Installation Guide */}
            <section className="w-full bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-xl shadow-slate-100 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Smartphone className="w-32 h-32 text-slate-900" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-slate-900 p-2 rounded-lg">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-lg text-slate-900 tracking-tight">Install on iPhone</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 italic">1</div>
                  <p className="text-xs text-slate-500 leading-relaxed">Open this page in <span className="text-slate-900 font-bold">Safari</span>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 italic">2</div>
                  <p className="text-xs text-slate-500 leading-relaxed flex items-center gap-1.5">Tap the <Share className="w-3.5 h-3.5 text-blue-500" /> <span className="text-slate-900 font-bold">Share</span> button at the bottom.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 italic">3</div>
                  <p className="text-xs text-slate-500 leading-relaxed flex items-center gap-1.5">Tap <PlusSquare className="w-3.5 h-3.5 text-slate-700" /> <span className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Add to Home Screen</span>.</p>
                </div>
              </div>
            </section>

            {/* Android Installation Guide */}
            <section className="w-full bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl shadow-slate-200 text-white overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Smartphone className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-lg tracking-tight">Install on Android</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 italic">1</div>
                  <p className="text-xs text-slate-300 leading-relaxed">Open this page in <span className="text-white font-bold underline decoration-primary">Chrome</span>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 italic">2</div>
                  <p className="text-xs text-slate-300 leading-relaxed">Tap the <span className="text-white font-bold">three dots (⋮)</span> menu.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 italic">3</div>
                  <p className="text-xs text-slate-300 leading-relaxed"><span className="text-primary font-black uppercase tracking-widest text-[10px]">"Install app"</span> or <span className="text-primary font-black uppercase tracking-widest text-[10px]">"Add to Home screen"</span>.</p>
                </div>
              </div>
            </section>
          </div>

          <div className="w-full h-[1px] bg-slate-100 my-2"></div>

          {/* Feature Tutorials */}
          <section className="w-full bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <Sliders className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-800">Customize Setup</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Tap the <span className="text-primary font-bold">Gear Icon</span>. Choose between 
              <span className="font-bold text-slate-700"> Flashcard</span> (flip) or 
              <span className="font-bold text-slate-700"> Quiz</span> (fill blanks).
            </p>
          </section>

          <section className="w-full bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <Pointer className="w-5 h-5 text-secondary" />
              <h3 className="font-bold text-slate-800">Flip & Fold</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700">Flashcard:</span> Tap anywhere to flip.
              <br/>
              <span className="font-bold text-slate-700">Folded Card:</span> When using 3+ features, tap to cycle through surfaces.
            </p>
          </section>

          <section className="w-full bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-bold text-slate-800">Track Progress</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Mark mastery:
              <br/>• <span className="text-green-600 font-bold">YES</span>: Mastered (hidden from queue).
              <br/>• <span className="text-secondary font-bold">MAYBE</span>: Review later.
              <br/>• <span className="text-red-500 font-bold">NO</span>: Shuffled back into session.
            </p>
          </section>
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
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}
    </div>
  );
};

export default App;
