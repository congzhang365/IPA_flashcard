import React from 'react';
import { Heart } from 'lucide-react';
import type { HeartSurprise as Surprise } from '../services/heartReactions';

const stars = [
  { symbol: 'ə', x: 18, y: 67 }, { symbol: 'ʃ', x: 35, y: 30 },
  { symbol: 'ɡ', x: 53, y: 53 }, { symbol: 'æ', x: 69, y: 19 },
  { symbol: 'ɲ', x: 83, y: 65 },
];

/** Pure visual layer, also used by the isolated development preview. */
export const HeartSurprise: React.FC<{ surprise: Surprise }> = ({ surprise }) => (
  <div className={`likes-widget__surprise likes-widget__surprise--${surprise.kind}`} aria-hidden="true">
    <div className="likes-widget__surprise-scene">
      {surprise.kind === 'constellation' && <>
        <svg className="likes-widget__constellation-lines" viewBox="0 0 220 100" focusable="false">
          <polyline points="40,67 77,30 117,53 152,19 183,65" />
        </svg>
        {stars.map((star, index) => (
          <span key={star.symbol} className="likes-widget__constellation-star ipa-font"
            style={{ left: `${star.x}%`, top: `${star.y}%`, '--spark-delay': `${index * 65}ms` } as React.CSSProperties}>
            {star.symbol}
          </span>
        ))}
        <span className="likes-widget__constellation-spark">✦</span>
      </>}
      {surprise.kind === 'butterfly' && <>
        {[0, 1, 2, 3].map(index => <span key={index} className="likes-widget__butterfly-trail"
          style={{ left: `${22 + index * 16}%`, top: `${66 - index * 10}%`, '--spark-delay': `${index * 120}ms` } as React.CSSProperties}>♥</span>)}
        <span className="likes-widget__butterfly">🦋</span>
      </>}
      {surprise.kind === 'golden' && <>
        <Heart className="likes-widget__golden-heart" />
        {stars.map((star, index) => <span key={index} className="likes-widget__golden-spark"
          style={{ left: `${star.x}%`, top: `${star.y}%`, '--spark-delay': `${index * 65}ms` } as React.CSSProperties}>✦</span>)}
      </>}
      {surprise.kind === 'milestone' && <span className="likes-widget__milestone">
        {surprise.count.toLocaleString('en-GB')} hearts from you! <span>💖</span>
      </span>}
    </div>
  </div>
);
