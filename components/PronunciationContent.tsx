import type { IPACardData, LexicalExample, PronunciationPart } from '../types';
import { pronunciationContent, splitAnnotatedText } from '../data/pronunciation';
import './PronunciationContent.css';

export function PronunciationText({ parts }: { parts: readonly PronunciationPart[] }) {
  return <>{parts.map((part, index) => part.kind === 'ipa'
    ? <span className="ipa-font pronunciation-ipa" key={index}>{part.text}</span>
    : part.kind === 'word' ? <em key={index}>{part.text}</em> : part.text)}</>;
}

export function PronunciationLabel({ card }: { card: Pick<IPACardData, 'id' | 'label'> }) {
  return <PronunciationText parts={splitAnnotatedText(card.label, card.id === 'C079' ? ['ʃ', 'x'] : [])} />;
}

export function WordExample({ example }: { example: LexicalExample }) {
  const language = example.variety.toLocaleLowerCase().includes(example.language.toLocaleLowerCase())
    ? example.variety : `${example.language} (${example.variety})`;
  return <span className="pronunciation-example"><em>{example.word}</em>{' '}
    <span className="ipa-font pronunciation-ipa">{example.ipa}</span>{", '"}{example.meaning}{"' in "}{language}.
  </span>;
}

/** No raw legacy word strings enter the UI: disputed examples await author review. */
export function PronunciationContent({ card, compact = false }: {
  card: Pick<IPACardData, 'id' | 'pronunciationTip' | 'words'>;
  compact?: boolean;
}) {
  const { tip, example } = pronunciationContent(card);
  return <div className={`pronunciation-content${compact ? ' pronunciation-content--compact' : ''}`}>
    {tip.length > 0 && <p className="pronunciation-tip"><PronunciationText parts={tip} /></p>}
    {example && <p className="pronunciation-example-row"><WordExample example={example} /></p>}
  </div>;
}
