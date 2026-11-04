import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftRight, Info, Volume2, X } from 'lucide-react';
import { ipaDataset } from '../data/ipaData';
import {
  nonPulmonicColumns, nonPulmonicRows,
  otherSymbolRows, pulmonicPlaces, pulmonicRows,
  vowelHeightLabels, vowelPositions, diacriticRows, additionalArticulationIds,
  stressLengthIds, toneRows, intonationIds,
} from '../data/chartData';
import type { ChartSound } from '../data/chartData';
import { hasBundledAudio, playIPASound, stopIPASound } from '../services/audioService';
import { positionChartCallout } from '../services/chartCallout';
import { PronunciationContent, PronunciationLabel } from './PronunciationContent';
import { DiacriticExample } from './DiacriticExample';
import './IPAChart.css';

type ChartTab = 'consonants' | 'vowels' | 'other' | 'diacritics';
type AudioState = 'idle' | 'loading' | 'played' | 'unavailable' | 'error';
interface CalloutState { sound: ChartSound; anchor: HTMLButtonElement; pinned: boolean; keyboard: boolean }
type CalloutStyle = CSSProperties & { '--callout-arrow-offset'?: string };

const tabs: readonly { id: ChartTab; label: string }[] = [
  { id: 'consonants', label: 'Consonants' },
  { id: 'vowels', label: 'Vowels' },
  { id: 'other', label: 'Other symbols' },
  { id: 'diacritics', label: 'Diacritics' },
];

// Every chart entry shares its record with the study cards.
const soundsById = new Map<string, ChartSound>(
  ipaDataset.map(sound => [sound.id, sound]),
);

function ChartSymbol({ sound }: { sound: ChartSound }) {
  return sound.category === 'diacritic'
    ? <DiacriticExample symbol={soundsById.get(sound.id)!.symbol} />
    : <>{sound.symbol}</>;
}

function ChartScroller({ children, label, onScroll }: {
  children: ReactNode; label: string; onScroll: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const update = () => setEdges({
      overflow: element.scrollWidth > element.clientWidth + 2,
      left: element.scrollLeft > 2,
      right: element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
    });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    element.addEventListener('scroll', update, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, []);

  return (
    <div className="ipa-chart__scroll-shell" data-more-left={edges.left} data-more-right={edges.right}>
      {edges.overflow && (
        <p className="ipa-chart__scroll-hint"><ArrowLeftRight size={15} aria-hidden="true" /> Swipe or scroll sideways to explore. Headers stay visible.</p>
      )}
      <div ref={scroller} className="ipa-chart__scroller" role="region" aria-label={label} tabIndex={0} onScroll={onScroll}>
        {children}
      </div>
    </div>
  );
}

/** Standalone Chart page; its parent supplies navigation and the wider page shell. */
export function IPAChart() {
  const prefix = useId();
  const calloutId = `${prefix}-callout`;
  const [tab, setTab] = useState<ChartTab>('consonants');
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [callout, setCallout] = useState<CalloutState | null>(null);
  const currentCallout = useRef<CalloutState | null>(null);
  const [calloutPosition, setCalloutPosition] = useState<CalloutStyle>({ visibility: 'hidden' });
  const [placement, setPlacement] = useState('bottom');
  const calloutElement = useRef<HTMLDivElement>(null);
  const calloutBody = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const focusedAnchor = useRef<HTMLButtonElement | null>(null);
  const dismissedAnchor = useRef<HTMLButtonElement | null>(null);
  const suppressHover = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const playbackRequest = useRef(0);
  const tabRefs = useRef<Partial<Record<ChartTab, HTMLButtonElement>>>({});
  const gesture = useRef({ x: 0, y: 0, moved: false });

  const cancelHide = () => {
    if (hideTimer.current !== undefined) clearTimeout(hideTimer.current);
    hideTimer.current = undefined;
  };

  const updateCallout = (next: CalloutState | null) => {
    currentCallout.current = next;
    setCallout(next);
  };

  const dismissCallout = (restoreFocus = false) => {
    const current = currentCallout.current;
    if (!current) return;
    cancelHide();
    dismissedAnchor.current = current.anchor;
    suppressHover.current = true;
    playbackRequest.current += 1;
    stopIPASound();
    updateCallout(null);
    setAudioState('idle');
    if (restoreFocus && current.anchor.isConnected) current.anchor.focus({ preventScroll: true });
  };

  const scheduleHide = () => {
    cancelHide();
    if (currentCallout.current?.pinned) return;
    hideTimer.current = setTimeout(() => {
      const current = currentCallout.current;
      if (current?.pinned || current?.anchor === focusedAnchor.current) return;
      dismissCallout();
    }, 180);
  };

  const showPreview = (sound: ChartSound, anchor: HTMLButtonElement, keyboard = false) => {
    cancelHide();
    if ((!keyboard && suppressHover.current) || currentCallout.current?.pinned || dismissedAnchor.current === anchor) return;
    if (currentCallout.current?.anchor === anchor) return;
    updateCallout({ sound, anchor, pinned: false, keyboard: false });
  };

  useEffect(() => () => {
    playbackRequest.current += 1;
    if (hideTimer.current !== undefined) clearTimeout(hideTimer.current);
    stopIPASound();
  }, []);

  useEffect(() => {
    if (!callout) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        const restoreFocus = !!calloutElement.current?.contains(document.activeElement);
        dismissCallout(restoreFocus);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || calloutElement.current?.contains(target)) return;
      // Let a new symbol's own click switch the callout in one action.
      if (target.closest('.ipa-chart__sound')) return;
      dismissCallout();
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || calloutElement.current?.contains(target) || target.closest('.ipa-chart__sound')) return;
      dismissCallout();
    };
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && calloutElement.current?.contains(event.target)) return;
      dismissCallout();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('scroll', onScroll, true);
    if (callout.pinned && callout.keyboard) closeButton.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [callout]);

  useLayoutEffect(() => {
    if (!callout) return;
    const position = () => {
      const anchor = callout.anchor.getBoundingClientRect();
      const popup = calloutElement.current;
      if (!popup) return;
      const viewport = window.visualViewport;
      const navigation = document.querySelector('nav')?.getBoundingClientRect();
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const sectionTabs = tabRefs.current.consonants?.closest('[role="tablist"]')?.getBoundingClientRect();
      const bottomLimit = navigation && navigation.height > 0 && navigation.top > viewportTop ? navigation.top : undefined;
      const visibleBottom = Math.min(viewportTop + viewportHeight, bottomLimit ?? Infinity);
      // Reserve the section tabs when room permits; always protect bottom navigation.
      const contentTop = sectionTabs && sectionTabs.bottom > viewportTop && sectionTabs.bottom <= visibleBottom - 160
        ? Math.max(viewportTop, sectionTabs.bottom) : viewportTop;
      const body = calloutBody.current;
      const naturalHeight = popup.getBoundingClientRect().height + (body ? Math.max(0, body.scrollHeight - body.clientHeight) : 0);
      const next = positionChartCallout(anchor, {
        left: viewport?.offsetLeft ?? 0, top: contentTop,
        width: viewport?.width ?? document.documentElement.clientWidth,
        height: viewportTop + viewportHeight - contentTop,
        bottomLimit,
      }, naturalHeight);
      setPlacement(next.placement);
      const style: CalloutStyle = { left: next.left, top: next.top, width: next.width,
        maxHeight: next.maxHeight, '--callout-arrow-offset': `${next.arrowOffset}px`, visibility: 'visible' };
      setCalloutPosition(previous => Object.keys(style).every(key => previous[key as keyof CalloutStyle] === style[key as keyof CalloutStyle]) ? previous : style);
    };
    position();
    const observer = new ResizeObserver(position);
    if (calloutElement.current) observer.observe(calloutElement.current);
    if (calloutBody.current?.firstElementChild) observer.observe(calloutBody.current.firstElementChild);
    window.addEventListener('resize', position);
    window.visualViewport?.addEventListener('resize', position);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('resize', position);
    };
  }, [callout, audioState]);

  const playSound = async (sound: ChartSound) => {
    const request = ++playbackRequest.current;
    stopIPASound();
    if (sound.category === 'diacritic' || !hasBundledAudio(sound.id)) { setAudioState('unavailable'); return; }
    setAudioState('loading');
    try {
      const played = await playIPASound(sound.id, sound.symbol);
      if (playbackRequest.current === request) setAudioState(played ? 'played' : 'error');
    } catch {
      if (playbackRequest.current === request) setAudioState('error');
    }
  };

  const selectSound = (sound: ChartSound, anchor: HTMLButtonElement, keyboard: boolean) => {
    cancelHide();
    const current = currentCallout.current;
    if (current?.pinned && current.anchor === anchor) { dismissCallout(); return; }
    dismissedAnchor.current = null;
    updateCallout({ sound, anchor, pinned: true, keyboard });
    void playSound(sound);
  };

  const changeTab = (next: ChartTab) => {
    dismissCallout();
    focusedAnchor.current = null;
    dismissedAnchor.current = null;
    setTab(next);
    setAudioState('idle');
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    changeTab(tabs[nextIndex].id);
    tabRefs.current[tabs[nextIndex].id]?.focus();
  };

  const soundButton = (id: string, displaySymbol?: string) => {
    const record = soundsById.get(id);
    if (!record) return null;
    const sound = displaySymbol ? { ...record, symbol: displaySymbol } : record;
    const available = sound.category !== 'diacritic' && hasBundledAudio(id);
    return (
      <button
        key={id}
        type="button"
        className="ipa-chart__sound ipa-font"
        data-sound-id={id}
        data-audio-available={available}
        aria-label={`${sound.symbol}: ${sound.label}. ${available ? 'Play audio and show pronunciation cue.' : 'Show pronunciation cue. Audio not currently available.'}`}
        aria-pressed={callout?.pinned && callout.sound.id === id || false}
        aria-haspopup="dialog"
        aria-expanded={callout?.pinned && callout.sound.id === id || false}
        aria-controls={callout?.pinned && callout.sound.id === id ? calloutId : undefined}
        aria-describedby={callout && !callout.pinned && callout.sound.id === id ? calloutId : undefined}
        onPointerEnter={event => {
          if (event.pointerType !== 'touch' && !event.buttons) showPreview(sound, event.currentTarget);
        }}
        onPointerLeave={event => {
          if (dismissedAnchor.current === event.currentTarget) dismissedAnchor.current = null;
          scheduleHide();
        }}
        onFocus={event => {
          if (event.currentTarget.matches(':focus-visible')) {
            if (currentCallout.current?.pinned && currentCallout.current.anchor !== event.currentTarget) dismissCallout();
            focusedAnchor.current = event.currentTarget;
            showPreview(sound, event.currentTarget, true);
          }
        }}
        onBlur={event => {
          if (focusedAnchor.current === event.currentTarget) focusedAnchor.current = null;
          if (dismissedAnchor.current === event.currentTarget) dismissedAnchor.current = null;
          scheduleHide();
        }}
        onClick={event => selectSound(sound, event.currentTarget, event.detail === 0)}
      >
        <ChartSymbol sound={sound} />
      </button>
    );
  };

  return (
    <section
      className="ipa-chart"
      aria-labelledby={`${prefix}-heading`}
      onPointerDownCapture={event => { gesture.current = { x: event.clientX, y: event.clientY, moved: false }; }}
      onPointerMoveCapture={event => {
        if (Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 10) gesture.current.moved = true;
        // Removing a bubble exposes cells under the stationary cursor. Wait for
        // deliberate mouse movement before showing another hover preview.
        if (event.pointerType !== 'touch' && !event.buttons && (event.movementX || event.movementY)) {
          suppressHover.current = false;
          const anchor = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('.ipa-chart__sound') : null;
          const sound = anchor?.dataset.soundId ? soundsById.get(anchor.dataset.soundId) : undefined;
          if (anchor && sound) showPreview(sound, anchor);
        }
      }}
      onPointerCancelCapture={event => {
        gesture.current.moved = true;
        if (!calloutElement.current?.contains(event.target as Node)) dismissCallout();
      }}
      onClickCapture={event => {
        if (event.detail > 0 && gesture.current.moved) {
          event.preventDefault();
          event.stopPropagation();
          gesture.current.moved = false;
        }
      }}
    >
      <header className="ipa-chart__intro">
        <div className="ipa-chart__eyebrow">Explore the sounds</div>
        <h1 id={`${prefix}-heading`}>IPA Chart</h1>
        <p>Tap a symbol for its tip and available audio; tap it again to close. Hover or use keyboard focus to preview a tip. Diacritics show explanations only. Scroll or switch tabs to continue exploring.</p>
      </header>

      <div className="ipa-chart__tabs" role="tablist" aria-label="IPA chart sections">
        {tabs.map((item, index) => (
          <button
            key={item.id} type="button" role="tab"
            ref={element => { if (element) tabRefs.current[item.id] = element; }}
            id={`${prefix}-tab-${item.id}`} aria-controls={`${prefix}-panel-${item.id}`}
            aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1}
            onClick={() => changeTab(item.id)} onKeyDown={event => onTabKeyDown(event, index)}
          >{item.label}</button>
        ))}
      </div>

      <div key={tab} role="tabpanel" id={`${prefix}-panel-${tab}`} aria-labelledby={`${prefix}-tab-${tab}`} className="ipa-chart__panel">
        {tab === 'consonants' && <>
          <h2>Consonants <span>(pulmonic)</span></h2>
          <ChartScroller label="Pulmonic consonant chart. Scroll horizontally for more places of articulation." onScroll={() => dismissCallout()}>
            <table className="ipa-chart__pulmonic">
              <caption className="ipa-chart__sr-only">Pulmonic consonants by place and manner of articulation. Voiceless symbols are on the left; voiced symbols are on the right. Shading marks articulations judged impossible.</caption>
              <colgroup><col className="ipa-chart__manner-col" />{Array.from({ length: 22 }, (_, index) => <col className="ipa-chart__sound-col" key={index} />)}</colgroup>
              <thead><tr>
                <th className="ipa-chart__corner" scope="col">Manner <span aria-hidden="true">↓</span><br />Place <span aria-hidden="true">→</span></th>
                {pulmonicPlaces.map((place, index) => <th key={place} id={`${prefix}-place-${index}`} colSpan={2} scope="colgroup">{place}</th>)}
              </tr></thead>
              <tbody>{pulmonicRows.map((row, rowIndex) => <tr key={row.manner}>
                <th id={`${prefix}-manner-${rowIndex}`} scope="row">{row.manner}</th>
                {row.cells.map(cell => {
                  const span = cell.span || 1;
                  const middle = span - 1;
                  const places = pulmonicPlaces.slice(cell.place, cell.place + span).join(' / ');
                  return <td key={cell.place} colSpan={span * 2}
                    headers={`${prefix}-manner-${rowIndex} ${Array.from({ length: span }, (_, index) => `${prefix}-place-${cell.place + index}`).join(' ')}`}
                    aria-label={!cell.voiceless && !cell.voiced ? `${places}, ${row.manner}: ${cell.impossible === 'both' ? 'articulation judged impossible' : 'no symbol assigned'}` : undefined}
                  >
                    <div className="ipa-chart__cell-slots" style={{ gridTemplateColumns: `repeat(${span * 2}, minmax(0, 1fr))` }}>
                      {Array.from({ length: span * 2 }, (_, slot) => {
                        const isLeft = slot === middle;
                        const isRight = slot === middle + 1;
                        const id = isLeft ? cell.voiceless : isRight ? cell.voiced : undefined;
                        const impossible = cell.impossible === 'both' || (isLeft && cell.impossible === 'voiceless') || (isRight && cell.impossible === 'voiced');
                        return <div key={slot} className={`ipa-chart__slot${impossible ? ' ipa-chart__slot--impossible' : ''}`}>
                          {impossible && <span className="ipa-chart__sr-only">{places}: {isLeft ? 'voiceless' : 'voiced'} articulation judged impossible.</span>}
                          {id && soundButton(id)}
                        </div>;
                      })}
                    </div>
                  </td>;
                })}
              </tr>)}</tbody>
            </table>
          </ChartScroller>
          <p className="ipa-chart__legend"><span className="ipa-chart__shade-key" aria-hidden="true" /> Shaded areas denote articulations judged impossible. Within a cell, left = voiceless; right = voiced.</p>

          <h2>Consonants <span>(non-pulmonic)</span></h2>
          <ChartScroller label="Non-pulmonic consonant chart. Clicks, voiced implosives and ejectives in three columns." onScroll={() => dismissCallout()}>
            <table className="ipa-chart__nonpulmonic">
              <caption className="ipa-chart__sr-only">Clicks, voiced implosives and ejectives in the official IPA chart order.</caption>
              <thead><tr>{nonPulmonicColumns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
              <tbody>{nonPulmonicRows.map((row, index) => <tr key={index}>{row.map(entry => <td key={entry.id}>
                <div className="ipa-chart__named-sound">{soundButton(entry.id)}<span>{entry.description}</span></div>
              </td>)}</tr>)}</tbody>
            </table>
          </ChartScroller>
        </>}

        {tab === 'vowels' && <>
          <h2>Vowels</h2>
          <ChartScroller label="Vowel quadrilateral. Scroll horizontally if needed. Height labels remain at the left." onScroll={() => dismissCallout()}>
            <div className="ipa-chart__vowel-board">
              <div className="ipa-chart__vowel-corner">Height / position</div>
              <div className="ipa-chart__vowel-headings">
                <span style={{ left: `${50 / 5.2}%` }}>Front</span>
                <span style={{ left: `${263 / 5.2}%` }}>Central</span>
                <span style={{ left: `${476 / 5.2}%` }}>Back</span>
              </div>
              <div className="ipa-chart__vowel-heights">{vowelHeightLabels.map(height => <span key={height.label} style={{ top: `${height.y}%` }}>{height.label}</span>)}</div>
              <div className="ipa-chart__vowel-space" role="group" aria-label="28 vowels in the IPA quadrilateral. Paired symbols have unrounded on the left and rounded on the right.">
                <svg viewBox="0 0 520 520" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M 50 50 H 476 V 470 H 264 Z M 263 50 L 369 470 M 121.333 190 H 476 M 192.667 330 H 476" />
                </svg>
                {vowelPositions.map(position => <div key={position.ids.join('-')}
                  className={`ipa-chart__vowel-position${position.ids.length === 2 ? ' ipa-chart__vowel-position--pair' : ''}`}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                >
                  {position.ids.length === 2 && position.dot && <span className="ipa-chart__vowel-dot" aria-hidden="true" />}
                  {position.ids.map(id => soundButton(id))}
                </div>)}
              </div>
            </div>
          </ChartScroller>
          <p className="ipa-chart__legend"><Info size={16} aria-hidden="true" /> Where symbols appear in pairs, the one on the right represents a rounded vowel; the one on the left is unrounded.</p>
        </>}

        {tab === 'other' && <>
          <h2>Other symbols</h2>
          <ChartScroller label="Other IPA symbols in the official two-column layout. Scroll horizontally if needed." onScroll={() => dismissCallout()}>
            <table className="ipa-chart__other">
              <caption className="ipa-chart__sr-only">Other symbols in the official IPA chart arrangement, with tie bars below and above.</caption>
              <colgroup><col className="ipa-chart__other-symbol-col" /><col /><col className="ipa-chart__other-symbol-col" /><col className="ipa-chart__other-symbol-col" /><col /></colgroup>
              <tbody>{otherSymbolRows.map((row, index) => <tr key={row.left}>
                <td>{soundButton(row.left)}</td><td>{row.description}</td>
                {index === 3 ? <td colSpan={3} rowSpan={2} className="ipa-chart__tie-note">Affricates and double articulations can be represented by two symbols joined by a tie bar if necessary.</td>
                  : index === 4 ? null
                  : <>{row.right.map((id, slot) => <td key={slot}>{id ? soundButton(id, id === 'D147A' ? 't͡s' : id === 'D147B' ? 't͜s' : undefined) : null}</td>)}
                    <td>{row.left === 'C072' ? <>Simultaneous <span className="ipa-font">ʃ</span> and <span className="ipa-font">x</span></> : row.rightDescription}</td></>}
              </tr>)}</tbody>
            </table>
          </ChartScroller>
        </>}

        {tab === 'diacritics' && <>
          <h2>Articulation</h2>
          <p className="ipa-chart__legend">Grey letters show placement; the dark mark is the diacritic. Tap a mark for its explanation. Audio not currently available.</p>
          <ChartScroller label="IPA articulation diacritics in the standard three-column arrangement." onScroll={() => dismissCallout()}>
            <table className="ipa-chart__diacritics">
              <caption className="ipa-chart__sr-only">Articulation diacritics, with an illustrative carrier and label. No audio.</caption>
              <tbody>{diacriticRows.map((row, index) => <tr key={index}>{row.map((id, column) => <td key={column}>
                {id && <div className="ipa-chart__named-sound">{soundButton(id)}<span>{soundsById.get(id)?.label}</span></div>}
              </td>)}</tr>)}</tbody>
            </table>
          </ChartScroller>
          <div className="ipa-chart__notation-list" aria-label="Ejective mark and tie bars">{additionalArticulationIds.map(id =>
            <div className="ipa-chart__named-sound" key={id}>{soundButton(id)}<span>{soundsById.get(id)?.label}</span></div>)}</div>

          <h2>Stress and length</h2>
          <div className="ipa-chart__notation-list">{stressLengthIds.map(id =>
            <div className="ipa-chart__named-sound" key={id}>{soundButton(id)}<span>{soundsById.get(id)?.label}</span></div>)}</div>

          <h2>Tones and intonation</h2>
          <ChartScroller label="Tone accent marks paired with corresponding Chao tone letters." onScroll={() => dismissCallout()}>
            <table className="ipa-chart__tones">
              <thead><tr><th scope="col">Accent mark</th><th scope="col">Chao letters</th><th scope="col">Tone</th></tr></thead>
              <tbody>{toneRows.map(([accent, chao]) => <tr key={accent}>
                <td>{soundButton(accent)}</td><td>{soundButton(chao)}</td><td>{soundsById.get(accent)?.label}</td>
              </tr>)}</tbody>
            </table>
          </ChartScroller>
          <div className="ipa-chart__notation-list">{intonationIds.map(id =>
            <div className="ipa-chart__named-sound" key={id}>{soundButton(id)}<span>{soundsById.get(id)?.label}</span></div>)}</div>
        </>}
      </div>

      {callout && typeof document !== 'undefined' && createPortal(
        <div ref={calloutElement} role={callout.pinned ? 'dialog' : 'tooltip'} id={calloutId}
          aria-modal={callout.pinned ? false : undefined}
          aria-labelledby={`${calloutId}-heading`}
          className="ipa-chart-callout" style={calloutPosition} data-placement={placement}
          onPointerEnter={cancelHide} onPointerLeave={scheduleHide}
        >
          <span className="ipa-chart-callout__arrow" aria-hidden="true" />
          <div className="ipa-chart-callout__heading">
            <span className="ipa-font" aria-hidden="true"><ChartSymbol sound={callout.sound} /></span>
            <strong id={`${calloutId}-heading`}><PronunciationLabel card={callout.sound} /></strong>
            {callout.pinned && <button ref={closeButton} type="button" className="ipa-chart-callout__close" aria-label="Close pronunciation tip" onClick={() => dismissCallout(true)}><X size={18} aria-hidden="true" /></button>}
          </div>
          <div ref={calloutBody} className="ipa-chart-callout__body">
            <PronunciationContent card={callout.sound} />
            {callout.pinned && callout.sound.category !== 'diacritic' && hasBundledAudio(callout.sound.id) && <button type="button" className="ipa-chart__replay" onClick={() => void playSound(callout.sound)}>
              <Volume2 size={17} aria-hidden="true" /> Replay sound
            </button>}
            <p className="ipa-chart-callout__status" role={callout.pinned ? 'status' : undefined} aria-live={callout.pinned ? 'polite' : undefined}>{callout.sound.category === 'diacritic' || !hasBundledAudio(callout.sound.id) ? 'Audio not currently available.'
              : callout.pinned && audioState === 'loading' ? 'Loading audio…'
                : callout.pinned && audioState === 'error' ? 'Audio could not be played. Please try again.' : ''}</p>
          </div>
        </div>, document.body,
      )}
    </section>
  );
}

export default IPAChart;
