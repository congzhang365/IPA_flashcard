import type { LexicalExample } from '../types';

/** Existing lexical examples, now with broad transcription and an explicit variety.
 * Replacements for disputed examples are held in PRONUNCIATION_REVIEW.md.
 * These short glosses and transcriptions are reference data, not dictionary prose.
 */
const british = (word: string, ipa: string, meaning: string): LexicalExample => ({
  word, ipa, meaning, language: 'English', variety: 'standard British English',
  source: `https://dictionary.cambridge.org/pronunciation/english/${word}`,
});
const french = (word: string, ipa: string, meaning: string): LexicalExample => ({
  word, ipa, meaning, language: 'French', variety: 'standard French',
  source: `https://www.cnrtl.fr/definition/${encodeURIComponent(word)}`,
});

export const lexicalExamples: Readonly<Record<string, LexicalExample>> = {
  C001: british('stop', '/stɒp/', 'stop'),
  C002: british('bat', '/bæt/', 'bat'),
  C003: british('tap', '/tæp/', 'tap'),
  C004: british('dad', '/dæd/', 'dad'),
  C009: british('cat', '/kæt/', 'cat'),
  C010: british('go', '/ɡəʊ/', 'go'),
  C014: british('man', '/mæn/', 'man'),
  C016: british('net', '/net/', 'net'),
  C019: british('sing', '/sɪŋ/', 'sing'),
  C022: { word: 'perro', ipa: '/ˈpero/', meaning: 'dog', language: 'Spanish', variety: 'Castilian Spanish', source: 'https://dle.rae.es/perro' },
  C025: { word: 'pero', ipa: '/ˈpeɾo/', meaning: 'but', language: 'Spanish', variety: 'Castilian Spanish', source: 'https://dle.rae.es/pero' },
  C029: british('fan', '/fæn/', 'fan'),
  C030: british('van', '/væn/', 'van'),
  C031: british('thin', '/θɪn/', 'thin'),
  C032: british('this', '/ðɪs/', 'this'),
  C033: british('sip', '/sɪp/', 'sip'),
  C034: british('zip', '/zɪp/', 'zip'),
  C035: british('she', '/ʃiː/', 'she'),
  C036: british('measure', '/ˈmeʒə/', 'measure'),
  C039: { word: 'ich', ipa: '/ɪç/', meaning: 'I', language: 'German', variety: 'standard German', source: 'https://www.dwds.de/wb/ich' },
  C041: { word: 'ach', ipa: '/ax/', meaning: 'oh', language: 'German', variety: 'standard German', source: 'https://www.dwds.de/wb/ach' },
  C044: french('rouge', '/ʁuʒ/', 'red'),
  C047: british('hat', '/hæt/', 'hat'),
  C052: british('run', '/rʌn/', 'run'),
  C054: british('yes', '/jes/', 'yes'),
  C056: british('let', '/let/', 'let'),
  C071: british('wet', '/wet/', 'wet'),
  C072: french('huit', '/ɥit/', 'eight'),
  V079: british('see', '/siː/', 'see'),
  V080: french('tu', '/ty/', 'you (singular, informal)'),
  V081: british('bit', '/bɪt/', 'bit'),
  V083: french('café', '/kafe/', 'coffee'),
  V084: french('feu', '/fø/', 'fire'),
  V085: french('lait', '/lɛ/', 'milk'),
  V086: french('jeune', '/ʒœn/', 'young'),
  V087: { ...british('bat', '/bæt/', 'bat'), variety: 'conservative Received Pronunciation' },
  V088: { word: 'casa', ipa: '/ˈkasa/', meaning: 'house', language: 'Spanish', variety: 'Castilian Spanish', source: 'https://dle.rae.es/casa' },
  V094: british('sofa', '/ˈsəʊfə/', 'sofa'),
  V095: { ...british('bird', '/bɜːd/', 'bird'), variety: 'conservative Received Pronunciation' },
  V099: { word: 'luna', ipa: '/ˈluna/', meaning: 'moon', language: 'Spanish', variety: 'Castilian Spanish', source: 'https://dle.rae.es/luna' },
  V100: british('put', '/pʊt/', 'put'),
  V102: french('eau', '/o/', 'water'),
  V103: { ...british('but', '/bʌt/', 'but'), variety: 'conservative Received Pronunciation' },
  V104: { ...british('saw', '/sɔː/', 'saw'), variety: 'conservative Received Pronunciation' },
  V105: british('father', '/ˈfɑːðə/', 'father'),
  V106: british('lot', '/lɒt/', 'lot'),
};
