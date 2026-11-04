/**
 * Layout metadata for the IPA chart, independent of the study queue.
 *
 * Based on the International Phonetic Association's official IPA chart:
 * https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_E/IPA_charts_E.html
 * Copyright International Phonetic Association. Chart layout adaptation:
 * Creative Commons Attribution-ShareAlike 4.0 International.
 * https://creativecommons.org/licenses/by-sa/4.0/
 *
 * Do not infer a grid from the dataset order: several coronal cells are merged,
 * and blank (possible, but without a symbol) cells are not impossible cells.
 */

import type { IPACardData } from '../types';

export type ChartSound = IPACardData;

// All sounds, including C079–C083, now resolve from the study dataset.

export const pulmonicPlaces = [
  'Bilabial', 'Labiodental', 'Dental', 'Alveolar', 'Postalveolar',
  'Retroflex', 'Palatal', 'Velar', 'Uvular', 'Pharyngeal', 'Glottal',
] as const;

export interface PulmonicCell {
  /** Zero-based place column; spans refer to whole place columns, not sounds. */
  place: number;
  span?: number;
  voiceless?: string;
  voiced?: string;
  impossible?: 'both' | 'voiceless' | 'voiced';
}

export interface PulmonicRow {
  manner: string;
  cells: readonly PulmonicCell[];
}

/** Each row covers exactly eleven places (twenty-two phonation slots). */
export const pulmonicRows: readonly PulmonicRow[] = [
  {
    manner: 'Plosive', cells: [
      { place: 0, voiceless: 'C001', voiced: 'C002' }, { place: 1 },
      { place: 2, span: 3, voiceless: 'C003', voiced: 'C004' },
      { place: 5, voiceless: 'C005', voiced: 'C006' },
      { place: 6, voiceless: 'C007', voiced: 'C008' },
      { place: 7, voiceless: 'C009', voiced: 'C010' },
      { place: 8, voiceless: 'C011', voiced: 'C012' },
      { place: 9, impossible: 'voiced' },
      { place: 10, voiceless: 'C013', impossible: 'voiced' },
    ],
  },
  {
    manner: 'Nasal', cells: [
      { place: 0, voiced: 'C014' }, { place: 1, voiced: 'C015' },
      { place: 2, span: 3, voiced: 'C016' }, { place: 5, voiced: 'C017' },
      { place: 6, voiced: 'C018' }, { place: 7, voiced: 'C019' },
      { place: 8, voiced: 'C020' }, { place: 9, impossible: 'both' },
      { place: 10, impossible: 'both' },
    ],
  },
  {
    manner: 'Trill', cells: [
      { place: 0, voiced: 'C021' }, { place: 1 },
      { place: 2, span: 3, voiced: 'C022' }, { place: 5 }, { place: 6 },
      { place: 7, impossible: 'both' }, { place: 8, voiced: 'C023' },
      { place: 9 }, { place: 10, impossible: 'both' },
    ],
  },
  {
    manner: 'Tap or flap', cells: [
      { place: 0 }, { place: 1, voiced: 'C024' },
      { place: 2, span: 3, voiced: 'C025' }, { place: 5, voiced: 'C026' },
      { place: 6 }, { place: 7, impossible: 'both' }, { place: 8 },
      { place: 9 }, { place: 10, impossible: 'both' },
    ],
  },
  {
    manner: 'Fricative', cells: [
      { place: 0, voiceless: 'C027', voiced: 'C028' },
      { place: 1, voiceless: 'C029', voiced: 'C030' },
      { place: 2, voiceless: 'C031', voiced: 'C032' },
      { place: 3, voiceless: 'C033', voiced: 'C034' },
      { place: 4, voiceless: 'C035', voiced: 'C036' },
      { place: 5, voiceless: 'C037', voiced: 'C038' },
      { place: 6, voiceless: 'C039', voiced: 'C040' },
      { place: 7, voiceless: 'C041', voiced: 'C042' },
      { place: 8, voiceless: 'C043', voiced: 'C044' },
      { place: 9, voiceless: 'C045', voiced: 'C046' },
      { place: 10, voiceless: 'C047', voiced: 'C048' },
    ],
  },
  {
    manner: 'Lateral fricative', cells: [
      { place: 0, impossible: 'both' }, { place: 1, impossible: 'both' },
      { place: 2, span: 3, voiceless: 'C049', voiced: 'C050' },
      { place: 5 }, { place: 6 }, { place: 7 }, { place: 8 },
      { place: 9, impossible: 'both' }, { place: 10, impossible: 'both' },
    ],
  },
  {
    manner: 'Approximant', cells: [
      { place: 0 }, { place: 1, voiced: 'C051' },
      { place: 2, span: 3, voiced: 'C052' }, { place: 5, voiced: 'C053' },
      { place: 6, voiced: 'C054' }, { place: 7, voiced: 'C055' },
      { place: 8 }, { place: 9 }, { place: 10, impossible: 'both' },
    ],
  },
  {
    manner: 'Lateral approximant', cells: [
      { place: 0, impossible: 'both' }, { place: 1, impossible: 'both' },
      { place: 2, span: 3, voiced: 'C056' }, { place: 5, voiced: 'C057' },
      { place: 6, voiced: 'C058' }, { place: 7, voiced: 'C059' },
      { place: 8 }, { place: 9, impossible: 'both' },
      { place: 10, impossible: 'both' },
    ],
  },
];

export const nonPulmonicColumns = ['Clicks', 'Voiced implosives', 'Ejectives'] as const;

export const nonPulmonicRows: readonly (readonly { id: string; description: string }[])[] = [
  [{ id: 'C060', description: 'Bilabial' }, { id: 'C065', description: 'Bilabial' }, { id: 'D138', description: 'Ejective' }],
  [{ id: 'C061', description: 'Dental' }, { id: 'C066', description: 'Dental/alveolar' }, { id: 'C080', description: 'Bilabial' }],
  [{ id: 'C062', description: '(Post)alveolar' }, { id: 'C067', description: 'Palatal' }, { id: 'C081', description: 'Dental/alveolar' }],
  [{ id: 'C063', description: 'Palatoalveolar' }, { id: 'C068', description: 'Velar' }, { id: 'C082', description: 'Velar' }],
  [{ id: 'C064', description: 'Alveolar lateral' }, { id: 'C069', description: 'Uvular' }, { id: 'C083', description: 'Alveolar fricative' }],
];

export interface VowelPosition {
  ids: readonly string[];
  /** Percentage position within a 520 × 520 quadrilateral canvas. */
  x: number;
  y: number;
  dot?: boolean;
}

/**
 * Cardinal landmarks: close (50,50)/(263,50)/(476,50), open (264,470)/(476,470).
 * Front and central diagonals converge downwards; vowels are not a rectangular grid.
 * A paired position has unrounded on the left and rounded on the right of its dot.
 */
export const vowelPositions: readonly VowelPosition[] = [
  { ids: ['V079', 'V080'], x: 50 / 5.2, y: 50 / 5.2, dot: true },
  { ids: ['V090', 'V091'], x: 263 / 5.2, y: 50 / 5.2, dot: true },
  { ids: ['V098', 'V099'], x: 476 / 5.2, y: 50 / 5.2, dot: true },
  { ids: ['V081', 'V082'], x: 150 / 5.2, y: 112 / 5.2 },
  { ids: ['V100'], x: 400 / 5.2, y: 112 / 5.2 },
  { ids: ['V083', 'V084'], x: (50 + 214 / 3) / 5.2, y: 190 / 5.2, dot: true },
  { ids: ['V092', 'V093'], x: (263 + 106 / 3) / 5.2, y: 190 / 5.2, dot: true },
  { ids: ['V101', 'V102'], x: 476 / 5.2, y: 190 / 5.2, dot: true },
  { ids: ['V094'], x: 316 / 5.2, y: 260 / 5.2 },
  { ids: ['V085', 'V086'], x: (50 + 428 / 3) / 5.2, y: 330 / 5.2, dot: true },
  { ids: ['V095', 'V096'], x: (263 + 212 / 3) / 5.2, y: 330 / 5.2, dot: true },
  { ids: ['V103', 'V104'], x: 476 / 5.2, y: 330 / 5.2, dot: true },
  { ids: ['V087'], x: 222 / 5.2, y: 410 / 5.2 },
  { ids: ['V097'], x: 351 / 5.2, y: 400 / 5.2 },
  { ids: ['V088', 'V089'], x: 264 / 5.2, y: 470 / 5.2, dot: true },
  { ids: ['V105', 'V106'], x: 476 / 5.2, y: 470 / 5.2, dot: true },
];

export const vowelHeightLabels = [
  { label: 'Close', y: 50 / 5.2 },
  { label: 'Close-mid', y: 190 / 5.2 },
  { label: 'Open-mid', y: 330 / 5.2 },
  { label: 'Open', y: 470 / 5.2 },
] as const;

/** Columns stay side-by-side, including the official two-row tie-bar annotation. */
export const otherSymbolRows = [
  { left: 'C070', description: 'Voiceless labial-velar fricative', right: ['C076', 'C077'], rightDescription: 'Alveolo-palatal fricatives' },
  { left: 'C071', description: 'Voiced labial-velar approximant', right: ['', 'C078'], rightDescription: 'Voiced alveolar lateral flap' },
  { left: 'C072', description: 'Voiced labial-palatal approximant', right: ['C079', ''], rightDescription: 'Simultaneous ʃ and x' },
  { left: 'C073', description: 'Voiceless epiglottal fricative', right: [], rightDescription: '' },
  { left: 'C074', description: 'Voiced epiglottal fricative/approximant', right: [], rightDescription: '' },
  { left: 'C075', description: 'Epiglottal plosive', right: ['D147B', 'D147A'], rightDescription: 'Tie bar (below/above)' },
] as const;

/** Non-sound marks have no pronunciationTip in the study dataset. */
export const notationCues: Readonly<Record<string, string>> = {
  D138: 'Marks a glottalic egressive consonant. Close the glottis and raise the larynx so trapped air escapes through the oral constriction.',
  D147A: 'A tie bar above two symbols groups them as one affricate or double articulation, for example [t͡s]. It does not represent a separate sound.',
  D147B: 'A tie bar below two symbols groups them as one affricate or double articulation, for example [t͜s]. It does not represent a separate sound.',
};

/** The three articulation columns follow the standard IPA diacritic layout. */
export const diacriticRows: readonly (readonly (string | null)[])[] = [
  ['D107', 'D119', 'D131'], ['D108', 'D120', 'D132'],
  ['D109', 'D121', 'D133'], ['D110', 'D122', 'D134'],
  ['D111', 'D123', 'D135'], ['D112', 'D124', 'D136'],
  ['D113', 'D125', 'D137'], ['D114', 'D126', null],
  ['D115', 'D127', null], ['D116', 'D128', null],
  ['D117', 'D129', null], ['D118', 'D130', null],
];
export const additionalArticulationIds = ['D138', 'D147A', 'D147B'] as const;
export const stressLengthIds = ['D139', 'D140', 'D141', 'D142', 'D143'] as const;
/** Accent marks and Chao letters are alternative notations, not extra sounds. */
export const toneRows = [
  ['D148', 'D167'], ['D150', 'D168'], ['D152', 'D169'],
  ['D154', 'D170'], ['D156', 'D171'], ['D158', 'D172'],
  ['D160', 'D173'], ['D162', 'D174'], ['D164', 'D175'], ['D166', 'D176'],
] as const;
export const intonationIds = ['D177', 'D178'] as const;

export const chartSource = {
  url: 'https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_E/IPA_charts_E.html',
  interactiveUrl: 'https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_TI/IPA_charts_TI.html',
  licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  licenceVerifiedOn: '2026-10-30',
  licenceEvidenceUrl: 'https://www.internationalphoneticassociation.org/IPAcharts/common_files/arrays/cp.js',
  // The E source explicitly says: "They are made freely available under a
  // Creative Commons Attribution-Sharealike 4.0 International Deed (CC BY-SA 4.0)."
  // This is the chart-layout source, not the older full-ipa-chart page (3.0)
  // or the interactive implementation's separately licensed code/recordings.
} as const;
