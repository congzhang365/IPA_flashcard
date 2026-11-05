import React, { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { createBrowserLikesClient, LIKES_STORAGE_KEY } from '../services/likesService';
import { HEART_SURPRISE_MS, HeartReactionPicker, IPA_REACTIONS, type HeartSurprise as Surprise } from '../services/heartReactions';
import { HeartSurprise } from './HeartSurprise';
import { trackHeartClick } from '../services/analytics';
import './LikesWidget.css';

const number = (value: number) => value.toLocaleString('en-GB');

export const LikesWidget: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [client] = useState(createBrowserLikesClient);
  const [picker] = useState(() => new HeartReactionPicker());
  const [state, setState] = useState(() => client.getSnapshot());
  const [reactions, setReactions] = useState<{ id: number; symbol: string; emoji: string; count: number; drift: number }[]>([]);
  const [surprise, setSurprise] = useState<(Surprise & { id: number }) | null>(null);
  const surpriseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sequence = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = client.subscribe(setState);
    client.start();
    void client.refresh();
    const reconnect = () => { void client.refresh(true); void client.syncNow(); };
    const visible = () => { if (document.visibilityState === 'visible') reconnect(); };
    const stored = (event: StorageEvent) => {
      if (event.key === LIKES_STORAGE_KEY || event.key === null) client.reloadFromStorage();
    };
    window.addEventListener('online', reconnect);
    window.addEventListener('focus', reconnect);
    window.addEventListener('storage', stored);
    document.addEventListener('visibilitychange', visible);
    return () => {
      mounted.current = false;
      unsubscribe(); client.stop();
      window.removeEventListener('online', reconnect);
      window.removeEventListener('focus', reconnect);
      window.removeEventListener('storage', stored);
      document.removeEventListener('visibilitychange', visible);
      timers.current.forEach(clearTimeout);
      timers.current.clear();
      clearTimeout(surpriseTimer.current);
      surpriseTimer.current = undefined;
    };
  }, [client]);

  const giveHeart = () => {
    trackHeartClick();
    const id = sequence.current++;
    void client.addHeart().then(count => {
      if (!mounted.current) return;
      const index = Math.max(1, count) - 1;
      const choice = picker.next(count);
      const reaction = {
        id, symbol: IPA_REACTIONS[index % IPA_REACTIONS.length],
        emoji: choice.emoji, count, drift: ((id % 5) - 2) * 9,
      };
      setReactions(previous => [...previous.slice(-9), reaction]);
      const timer = setTimeout(() => {
        setReactions(previous => previous.filter(item => item.id !== id));
        timers.current.delete(timer);
      }, 1300);
      timers.current.add(timer);
      if (choice.surprise) {
        clearTimeout(surpriseTimer.current);
        setSurprise({ ...choice.surprise, id });
        surpriseTimer.current = setTimeout(() => {
          setSurprise(current => current?.id === id ? null : current);
          surpriseTimer.current = undefined;
        }, HEART_SURPRISE_MS);
      }
    });
  };

  return (
    <>
      <section className="likes-widget" aria-labelledby="ipa365-hearts-heading">
        <div className="likes-widget__body">
          <div className="likes-widget__playground">
            <button type="button" className={`likes-widget__heart${surprise?.kind === 'golden' ? ' likes-widget__heart--golden' : ''}`} onClick={giveHeart} aria-label="Give IPA365 a heart">
              <Heart key={sequence.current} className="likes-widget__heart-icon" aria-hidden="true" />
            </button>
            {reactions.map(reaction => (
              <span key={reaction.id} className="likes-widget__reaction" aria-hidden="true"
                style={{ '--heart-drift': `${reaction.drift}px` } as React.CSSProperties}>
                <span className="likes-widget__reaction-emoji">{reaction.emoji}</span>
                <span className="ipa-font">{reaction.symbol}</span>
                <span className="likes-widget__reaction-count">· {number(reaction.count)}</span>
              </span>
            ))}
          </div>
          <div className="likes-widget__copy">
            <h2 id="ipa365-hearts-heading">Like IPA365?</h2>
          </div>
        </div>
        {surprise && <HeartSurprise key={surprise.id} surprise={surprise} />}
        <p className="likes-widget__sr-only" role="status"><span data-heart-count="mine">{number(state.mine)}</span> {state.mine === 1 ? 'heart' : 'hearts'} from {state.persistent ? 'this device' : 'this visit'}.</p>
      </section>
      {children}
      <p className="likes-widget__total">
        <Heart aria-hidden="true" />
        <span className="likes-widget__sr-only">Total hearts</span>
        <span data-heart-count="shared" aria-label={state.shared === null ? 'Shared total unavailable' : undefined}>
          {state.shared === null ? '—' : number(state.shared)}
        </span>
      </p>
    </>
  );
};
