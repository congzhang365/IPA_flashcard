
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IPAFeature, AppSettings, CardState, LearningStatus } from './types';
import { ipaDataset } from './data/ipaData';
import { Flashcard } from './components/Flashcard';
import { FoldedCard } from './components/FoldedCard';
import { FeatureIcon, featureStyles } from './components/FeatureIcon';
import { KeyboardGroup } from './components/IPAKKeyboard';
import { SettingsOverlay } from './components/SettingsOverlay';
import { gradeQuizAnswer } from './services/quizGrading';
import { hasBundledAudio } from './services/audioService';
import { Settings, Layers, Microscope, Music, MoveHorizontal, RotateCcw, ChevronLeft, ChevronRight, BookOpen, Sliders, Construction, Smartphone, Share, PlusSquare, Star, Check, HelpCircle, X } from 'lucide-react';
// Audio service is used in components, no direct import needed here

const IPAAppCredits: React.FC = () => (
  <div className="mt-4 mb-1 text-center w-full">
    <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400/85">
      © 2026 <a href="https://congzhang-linguist.github.io/" target="_blank" rel="noopener noreferrer" style={{ color: '#00A5A9' }} className="hover:underline font-bold">Cong Zhang</a> @ Newcastle University
    </span>
  </div>
);

const formatStarScore = (score: number) => {
  if (score % 1 === 0.5) return `${Math.floor(score)}½`;
  return String(score);
};

const CollectedStar: React.FC<{ half?: boolean }> = ({ half = false }) => (
  <span className="relative inline-block h-1.5 w-1.5 shrink-0" aria-hidden="true">
    <Star className="absolute inset-0 h-1.5 w-1.5 fill-amber-400 text-amber-500" />
    {half && <span className="absolute inset-y-0 right-0 w-1/2 overflow-hidden bg-amber-100"><Star className="absolute right-0 top-0 h-1.5 w-1.5 fill-amber-100 text-amber-500" /></span>}
  </span>
);

const StarJar: React.FC<{ score: number; lastAward: number | null; lastMatchCount: number | null; topScores: number[] }> = ({ score, lastAward, lastMatchCount, topScores }) => {
  const visibleStarCount = Math.min(Math.floor(score), 24);
  const hiddenStarCount = Math.max(0, Math.floor(score) - visibleStarCount);

  return (
    <div className="mt-2 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 text-amber-700 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-14 shrink-0" aria-label={`Star jar: ${formatStarScore(score)} stars`}>
          <div className="absolute left-1/2 top-0 z-10 h-2 w-8 -translate-x-1/2 rounded-full bg-amber-400 shadow-sm" />
          <div className="absolute bottom-0 left-1/2 h-10 w-14 -translate-x-1/2 overflow-hidden rounded-b-xl rounded-t-md border-2 border-amber-300 bg-amber-100/90 px-1.5 pb-1 pt-2 shadow-inner">
            <div className="flex flex-wrap content-end justify-center gap-px">
              {Array.from({ length: visibleStarCount }, (_, index) => <CollectedStar key={`star-${index}`} />)}
              {score % 1 === 0.5 && hiddenStarCount === 0 && <CollectedStar half />}
            </div>
            {hiddenStarCount > 0 && <span className="absolute bottom-0.5 right-0.5 rounded bg-amber-300 px-0.5 text-[7px] font-black text-amber-800">+{hiddenStarCount}{score % 1 === 0.5 ? '½' : ''}</span>}
          </div>
          <Star key={`${score}-${lastAward}`} className="absolute -right-1 -top-3 z-20 h-4 w-4 fill-amber-400 text-amber-500 animate-bounce" />
          {lastAward !== null && lastAward > 0 && (
            <span className="absolute -right-3 -top-3 z-30 animate-ping text-[10px] font-black text-orange-500">+{lastAward === 0.5 ? '½' : '1'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Star jar</span>
            <span className="text-lg font-black leading-none">{formatStarScore(score)} <span className="text-[10px] font-bold uppercase tracking-wider">stars</span></span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-wider text-amber-600/80">
            <span>This answer: {lastAward === null ? '—' : `+${lastAward === 0.5 ? '½' : '1'} star${lastMatchCount !== null ? ` (${lastMatchCount}/3 labels)` : ''}`}</span>
            {topScores.length > 0 && <span className="truncate">Best: {topScores.map(formatStarScore).join(' · ')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const QueueCelebration: React.FC<{ score: number; preview?: boolean; onReset: () => void }> = ({ score, preview = false, onReset }) => (
  <div className="relative w-full overflow-hidden rounded-[3rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-primary/10 p-8 text-center shadow-2xl shadow-amber-200/40 animate-in fade-in zoom-in duration-500">
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 22 }, (_, index) => (
        <span
          key={index}
          className={`absolute top-0 h-2 w-1.5 rounded-full ${index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-amber-400' : 'bg-secondary'} animate-[confetti_2.4s_ease-in-out_infinite]`}
          style={{ left: `${5 + ((index * 17) % 90)}%`, animationDelay: `${(index % 8) * 0.12}s` }}
        />
      ))}
    </div>
    <div className="relative z-10">
      <div className="mb-4 text-5xl animate-bounce">🎉</div>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-700 shadow-inner">
        <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
        <span className="font-black">{formatStarScore(score)} stars collected</span>
        <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Queue Clear!</h2>
      <p className="text-slate-500 text-sm mb-7 leading-relaxed">
        {preview ? 'Celebration preview — this is what appears when you finish a session.' : "You've mastered all cards in this session. Great job!"}
      </p>
      <button
        onClick={onReset}
        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
      >
        {preview ? 'CLOSE PREVIEW' : 'RESET PROGRESS'}
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const celebrationParams = new URLSearchParams(window.location.search);
  const isCelebrationPreview = celebrationParams.get('celebration-test') === '1';
  const celebrationPreviewScore = Number(celebrationParams.get('score')) || 12.5;
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
  const [isInstalled, setIsInstalled] = useState(false);
  const [installMessage, setInstallMessage] = useState('');
  
  const [cardState, setCardState] = useState<CardState>({
    currentQueueIndex: 0,
    isFlipped: false,
    userInput: '',
    feedback: 'none'
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'study' | 'lab' | 'tutorial'>('study');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'consonant' | 'vowel' | 'diacritic'>('all');
  const [lastKeyboardGroup, setLastKeyboardGroup] = useState<KeyboardGroup>(() => {
    const saved = localStorage.getItem('ipa_keyboard_group');
    return saved === 'Vowels' || saved === 'Diacritics' ? saved : 'Consonants';
  });
  
  const [installTab, setInstallTab] = useState<'ios' | 'android'>('ios');
  const [quizSessionScore, setQuizSessionScore] = useState(0);
  const [lastQuizAward, setLastQuizAward] = useState<number | null>(null);
  const [lastQuizMatchCount, setLastQuizMatchCount] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(0);
  const [topQuizScores, setTopQuizScores] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('quiz_top_scores');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const keyboardGroup: KeyboardGroup = selectedCategory === 'vowel'
    ? 'Vowels'
    : selectedCategory === 'diacritic'
      ? 'Diacritics'
      : selectedCategory === 'consonant'
        ? 'Consonants'
        : lastKeyboardGroup;
  const handleKeyboardGroupChange = (group: KeyboardGroup) => {
    if (selectedCategory !== 'all') return;
    setLastKeyboardGroup(group);
    localStorage.setItem('ipa_keyboard_group', group);
  };
  const installTouchStart = useRef<number | null>(null);
  const installTouchEnd = useRef<number | null>(null);
  const quizRunRecorded = useRef(false);

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
  const standaloneQuery = window.matchMedia('(display-mode: standalone)');

  const checkInstalled = () => {
    const isStandalone = standaloneQuery.matches;

    const isIOSStandalone =
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    const installed = isStandalone || isIOSStandalone;

    setIsInstalled(installed);

    if (installed) {
      setDeferredPrompt(null);
      setInstallMessage('');
    }
  };

  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();

    if (standaloneQuery.matches) {
      return;
    }

    setDeferredPrompt(e);
    setInstallMessage('');
  };

  const handleAppInstalled = () => {
    setIsInstalled(true);
    setDeferredPrompt(null);
    setInstallMessage('');
  };

  const handleDisplayModeChange = () => {
    checkInstalled();
  };

  checkInstalled();

  window.addEventListener(
    'beforeinstallprompt',
    handleBeforeInstallPrompt
  );

  window.addEventListener(
    'appinstalled',
    handleAppInstalled
  );

  standaloneQuery.addEventListener(
    'change',
    handleDisplayModeChange
  );

  return () => {
    window.removeEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    window.removeEventListener(
      'appinstalled',
      handleAppInstalled
    );

    standaloneQuery.removeEventListener(
      'change',
      handleDisplayModeChange
    );
  };
}, []);

const handleInstallClick = async () => {
  if (isInstalled) {
    return;
  }

  if (!deferredPrompt) {
    setInstallMessage(
      'This browser does not provide an automatic install prompt. Use the browser menu and choose “Install app” or “Add to Home Screen”.'
    );
    return;
  }

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    setDeferredPrompt(null);
    setInstallMessage('');
  } else {
    setInstallMessage(
      'Installation was cancelled. You can try again whenever you are ready.'
    );
  }
};

  // Initialize queue only on mount or when category changes
  useEffect(() => {
    const freshQueue = ipaDataset
      .filter(card => {
        const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
        const hasAudioIfNeeded = settings.promptFeature !== IPAFeature.SOUND || hasBundledAudio(card.id);
        const notRemembered = learnedMap[card.id] !== LearningStatus.REMEMBERED;
        return matchesCategory && hasAudioIfNeeded && notRemembered;
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
    setQuizSessionScore(0);
    setLastQuizAward(null);
    setLastQuizMatchCount(null);
    setQuizAnswered(0);
    quizRunRecorded.current = false;
  }, [selectedCategory, settings.promptFeature]);

  useEffect(() => {
    if (settings.promptFeature === IPAFeature.SOUND && selectedCategory === 'diacritic') {
      setSelectedCategory('all');
    }
  }, [settings.promptFeature, selectedCategory]);

  useEffect(() => {
    localStorage.setItem('learned_map', JSON.stringify(learnedMap));
  }, [learnedMap]);

  useEffect(() => {
    localStorage.setItem('quiz_top_scores', JSON.stringify(topQuizScores));
  }, [topQuizScores]);

  useEffect(() => {
    if (settings.mode === 'QUIZ') {
      setQuizSessionScore(0);
      setLastQuizAward(null);
      setLastQuizMatchCount(null);
      setQuizAnswered(0);
      quizRunRecorded.current = false;
    }
  }, [settings.mode]);

  useEffect(() => {
    if (settings.mode !== 'QUIZ' || studyQueue.length !== 0 || quizAnswered === 0 || quizRunRecorded.current) return;
    quizRunRecorded.current = true;
    setTopQuizScores(prev => [...prev, quizSessionScore].sort((a, b) => b - a).slice(0, 3));
  }, [settings.mode, studyQueue.length, quizAnswered, quizSessionScore]);

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
    const grade = gradeQuizAnswer(currentCard, input, settings.maskedFeature);
    setLastQuizAward(grade.score);
    setLastQuizMatchCount(
      grade.expectedLabels.length === 3 && grade.matchedLabels.length > 0
        ? grade.matchedLabels.length
        : null
    );
    setQuizSessionScore(prev => prev + grade.score);
    setQuizAnswered(prev => prev + 1);

    if (grade.score > 0) {
      triggerHaptic(grade.score === 1 ? 'success' : 'medium');
      setCardState(prev => ({ ...prev, feedback: grade.feedback, isFlipped: true }));
      // Give the player a moment to see the result before moving on.
      setTimeout(() => {
        if (grade.score === 1) {
          setCardState(prev => ({ ...prev, isFlipped: false }));
          setTimeout(() => {
            const cardId = currentCard.id;
            setLearnedMap(prev => ({ ...prev, [cardId]: LearningStatus.REMEMBERED }));
            removeCardFromQueue(cardId);
          }, 310);
        } else {
          // A half-point answer earns credit but keeps the card in rotation.
          setCardState(prev => ({
            ...prev,
            currentQueueIndex: studyQueue.length > 0 ? (prev.currentQueueIndex + 1) % studyQueue.length : 0,
            isFlipped: false,
            userInput: '',
            feedback: 'none'
          }));
        }
      }, 1200);
    } else {
      triggerHaptic('error');
      setCardState(prev => ({ ...prev, feedback: 'incorrect', isFlipped: true }));
      // Keep the current card mounted while its correct answer is revealed.
      const currentIndex = cardState.currentQueueIndex;
      const nextIndex = studyQueue.length > 1 && currentIndex < studyQueue.length - 1 ? currentIndex : 0;
      // Reveal the correct answer, then continue to the next card.
      setTimeout(() => {
        // Move the missed card to the end only after the reveal is complete.
        setStudyQueue(prev => {
          if (prev.length <= 1) return prev;
          const reordered = [...prev];
          const [missedCard] = reordered.splice(currentIndex, 1);
          reordered.push(missedCard);
          return reordered;
        });
        setCardState(prev => ({
          ...prev,
          currentQueueIndex: nextIndex,
          isFlipped: false,
          userInput: '',
          feedback: 'none'
        }));
      }, 1200);
    }
  };

  const resetAll = () => {
    setLearnedMap({});
    localStorage.removeItem('learned_map');
    
    // Explicitly reset the queue for current category
    const freshQueue = ipaDataset
      .filter(card => (selectedCategory === 'all' || card.category === selectedCategory)
        && (settings.promptFeature !== IPAFeature.SOUND || hasBundledAudio(card.id)))
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
          <img
            src="./favicon.png"
            alt="IPA365 logo"
            className="w-9 h-9 rounded-xl shadow-lg shadow-primary/20 object-contain"
          />
          <h1 className="text-xl font-black text-slate-800 tracking-tight">IPA365 Flashcards</h1>
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
              const isAudioUnavailable = settings.promptFeature === IPAFeature.SOUND && cat === 'diacritic';
              let displayName = 'All';
              if (cat === 'consonant') displayName = 'Consonants';
              if (cat === 'vowel') displayName = 'Vowels';
              if (cat === 'diacritic') displayName = 'Diacritics';
              
              return (
                <button
                  key={cat}
                  disabled={isAudioUnavailable}
                  onClick={() => {
                    if (isAudioUnavailable) return;
                    triggerHaptic('light');
                    setSelectedCategory(cat);
                  }}
                  className={`flex-1 py-2 rounded-full transition-all duration-300 text-[10px] font-bold uppercase tracking-wider relative ${
                    isAudioUnavailable
                      ? 'text-slate-300 cursor-not-allowed opacity-60'
                      : isActive
                      ? 'bg-primary text-white shadow-sm font-black scale-[1.02] z-10'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
          {settings.mode === 'QUIZ' && (
            <StarJar score={quizSessionScore} lastAward={lastQuizAward} lastMatchCount={lastQuizMatchCount} topScores={topQuizScores} />
          )}
        </div>
      )}

      {activeTab === 'study' ? (
        <main className="w-full flex-grow flex flex-col items-center justify-center gap-4 overflow-visible">
          {studyQueue.length > 0 && currentCard && !isCelebrationPreview ? (
            <div className="w-full relative flex flex-col items-center gap-4">
              <div 
                className={`w-full flex justify-center relative group ${
                  settings.mode === 'QUIZ' && settings.maskedFeature === IPAFeature.SYMBOL
                    ? 'h-[clamp(480px,calc(100dvh-300px),620px)]'
                    : 'h-[390px]'
                }`}
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
                    keyboardGroup={keyboardGroup}
                    onKeyboardGroupChange={handleKeyboardGroupChange}
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
                    keyboardGroup={keyboardGroup}
                    onKeyboardGroupChange={handleKeyboardGroupChange}
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
            <QueueCelebration score={isCelebrationPreview ? celebrationPreviewScore : quizSessionScore} preview={isCelebrationPreview} onReset={resetAll} />
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

          {/* How a study session works */}
          <section className="w-full bg-white p-5 rounded-[1.75rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/5 p-1.5 rounded-lg">
                <Sliders className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">How a Study Session Works</h3>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed space-y-2">
              <p>
                Choose your cards, prompt, answer, and study mode in the <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-[11px] align-middle"><Settings className="w-3.5 h-3.5 text-slate-500" /> Study Setup</span>. The prompt gives you the clue; the answer is the property you identify.
              </p>
              <ul className="space-y-2 pl-1.5 border-l-2 border-primary/20">
                <li>
                  <span className="font-bold text-slate-800">Two features:</span> a classic flashcard. Tap the card to flip between the prompt and answer.
                </li>
                <li>
                  <span className="font-bold text-slate-800">Three or more features:</span> a folded card with a tab for each view. Tap a tab or swipe left/right to browse.
                </li>
                <li>
                  <span className="font-bold text-slate-800">Quiz mode:</span> type or select your answer, then submit it for automatic marking and stars.
                </li>
              </ul>
            </div>
          </section>

          {/* Available Features Section */}
          <section className="w-full bg-white p-5 rounded-[1.75rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/5 p-1.5 rounded-lg">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">What Features are Available?</h3>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed space-y-2">
              <p>You can toggle on or off any combination of these four rich attributes:</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {Object.values(IPAFeature).map((feature) => (
                  <div key={feature} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${featureStyles[feature].background} ${featureStyles[feature].border} ${featureStyles[feature].text}`}>
                    <FeatureIcon feature={feature} className="text-base" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{feature === IPAFeature.EXAMPLES ? 'E.g.' : feature}</span>
                  </div>
                ))}
              </div>
              <ul className="space-y-2 pl-1.5 border-l-2 border-primary/20">
                <li>
                  <span className="font-bold text-slate-800">SYMBOL:</span> IPA symbols (e.g., <span className="ipa-font">[ð]</span>, <span className="ipa-font">[b]</span>).
                </li>
                <li>
                  <span className="font-bold text-slate-800">LABEL:</span> Three-term labels (e.g., <span className="italic">Voiced dental fricative</span>).
                </li>
                <li>
                  <span className="font-bold text-slate-800">SOUND:</span> An audio of the IPA symbol [currently under development, but will be available in the next version].
                </li>
                <li>
                  <span className="font-bold text-slate-800">EXAMPLES (E.g.):</span> Illustrative word examples demonstrating the sound or pronunciation tips.
                </li>
              </ul>
            </div>
          </section>

          {/* Quiz and review grading */}
          <section className="w-full bg-white p-5 rounded-[1.75rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/5 p-1.5 rounded-lg">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Quiz & Review: Grading and History</h3>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed space-y-2">
              <p>Quiz answers are marked automatically and your score is shown as stars. A fully correct answer earns <span className="font-bold text-slate-800">1 star</span>; a partial answer earns <span className="font-bold text-slate-800">half a star</span>.</p>
              <ul className="space-y-1.5 pl-1.5 border-l-2 border-primary/20">
                <li><span className="font-bold text-slate-800">IPA symbols:</span> The symbol must match. Length marks are accepted flexibly.</li>
                <li><span className="font-bold text-slate-800">Three-term labels:</span> All three matching terms earn 1 star; two matching terms earn half a star; fewer than two earn none.</li>
                <li><span className="font-bold text-slate-800">Examples:</span> The answer must match one of the listed examples.</li>
              </ul>
              <p>In review mode, use the feedback buttons after revealing the answer:</p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold mt-1">
                <div className="bg-green-50 border border-green-100 text-green-500 rounded-xl py-2 px-1 flex flex-col items-center gap-1">
                  <Check className="w-4 h-4" /><span>Yes</span><span className="text-[8px] font-normal lowercase text-green-500">archived from deck</span>
                </div>
                <div className="bg-secondary/10 border border-secondary/20 text-secondary rounded-xl py-2 px-1 flex flex-col items-center gap-1">
                  <HelpCircle className="w-4 h-4" /><span>Maybe</span><span className="text-[8px] font-normal lowercase text-secondary">kept in deck</span>
                </div>
                <div className="bg-red-50 border border-red-100 text-red-500 rounded-xl py-2 px-1 flex flex-col items-center gap-1">
                  <X className="w-4 h-4" /><span>No</span><span className="text-[8px] font-normal lowercase text-red-500">shuffled back</span>
                </div>
              </div>
              <p>A full-point quiz answer is removed from the deck; partial or incorrect answers return for more practice. The app keeps your three highest completed quiz scores.</p>
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

          {/* Device Specific Swipeable Installation Guides */}
          <div className="w-full bg-white p-5 rounded-[1.75rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-slate-50 pb-2">
              <div className="bg-primary/5 p-1.5 rounded-lg">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Offline Web App Setup</h3>
            </div>
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
    onInstall={isInstalled ? undefined : handleInstallClick}
    installAvailable={!isInstalled && Boolean(deferredPrompt)}
    installMessage={isInstalled ? '' : installMessage}
  />
)}
    </div>
  );
};

export default App;
