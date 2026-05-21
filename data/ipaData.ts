import { IPACardData } from '../types';

export const ipaDataset: IPACardData[] = [
  // CONSONANTS
  {
    id: 'C001',
    symbol: 'p',
    category: 'consonant',
    label: 'Voiceless bilabial plosive',
    words: ['pat', 'apple', 'stop'],
    audioPrompts: ['The voiceless bilabial plosive sound p', 'Pronounce p as in pat']
  },
  {
    id: 'C002',
    symbol: 'b',
    category: 'consonant',
    label: 'Voiced bilabial plosive',
    words: ['bat', 'rabbit', 'cab'],
    audioPrompts: ['The voiced bilabial plosive sound b', 'Pronounce b as in bat']
  },
  {
    id: 'C003',
    symbol: 't',
    category: 'consonant',
    label: 'Voiceless alveolar plosive',
    words: ['tap', 'better', 'pot'],
    audioPrompts: ['The voiceless alveolar plosive sound t', 'Pronounce t as in tap']
  },
  {
    id: 'C004',
    symbol: 'd',
    category: 'consonant',
    label: 'Voiced alveolar plosive',
    words: ['dad', 'ladder', 'sad'],
    audioPrompts: ['The voiced alveolar plosive sound d', 'Pronounce d as in dad']
  },
  {
    id: 'C005',
    symbol: 'ʈ',
    category: 'consonant',
    label: 'Voiceless retroflex plosive',
    words: ['t-sound in Swedish "stor" (retroflex)'],
    audioPrompts: ['Voiceless retroflex plosive']
  },
  {
    id: 'C006',
    symbol: 'ɖ',
    category: 'consonant',
    label: 'Voiced retroflex plosive',
    words: ['d-sound in Swedish "bord" (retroflex)'],
    audioPrompts: ['Voiced retroflex plosive']
  },
  {
    id: 'C007',
    symbol: 'c',
    category: 'consonant',
    label: 'Voiceless palatal plosive',
    words: ['Hungarian "tutaj"'],
    audioPrompts: ['Voiceless palatal plosive']
  },
  {
    id: 'C008',
    symbol: 'ɟ',
    category: 'consonant',
    label: 'Voiced palatal plosive',
    words: ['Hungarian "gyár"'],
    audioPrompts: ['Voiced palatal plosive']
  },
  {
    id: 'C009',
    symbol: 'k',
    category: 'consonant',
    label: 'Voiceless velar plosive',
    words: ['cat', 'bucket', 'back'],
    audioPrompts: ['The voiceless velar plosive sound k', 'Pronounce k as in cat']
  },
  {
    id: 'C010',
    symbol: 'g',
    category: 'consonant',
    label: 'Voiced velar plosive',
    words: ['go', 'bigger', 'bag'],
    audioPrompts: ['The voiced velar plosive sound g', 'Pronounce g as in go']
  },
  {
    id: 'C011',
    symbol: 'q',
    category: 'consonant',
    label: 'Voiceless uvular plosive',
    words: ['Arabic "Qur’an" (aspiration)'],
    audioPrompts: ['Voiceless uvular plosive']
  },
  {
    id: 'C012',
    symbol: 'ɢ',
    category: 'consonant',
    label: 'Voiced uvular plosive',
    words: ['Persian "Gharb" (some dialects)'],
    audioPrompts: ['Voiced uvular plosive']
  },
  {
    id: 'C013',
    symbol: 'ʔ',
    category: 'consonant',
    label: 'Voiceless glottal plosive',
    words: ['uh-oh (middle break)', 'button (bottle in Cockney)'],
    audioPrompts: ['The voiceless glottal plosive (glottal stop)']
  },
  {
    id: 'C014',
    symbol: 'm',
    category: 'consonant',
    label: 'Voiced bilabial nasal',
    words: ['man', 'hammer', 'him'],
    audioPrompts: ['Voiced bilabial nasal m']
  },
  {
    id: 'C015',
    symbol: 'ɱ',
    category: 'consonant',
    label: 'Voiced labiodental nasal',
    words: ['emphasis', 'symphony'],
    audioPrompts: ['Voiced labiodental nasal']
  },
  {
    id: 'C016',
    symbol: 'n',
    category: 'consonant',
    label: 'Voiced alveolar nasal',
    words: ['net', 'funny', 'pin'],
    audioPrompts: ['Voiced alveolar nasal n']
  },
  {
    id: 'C017',
    symbol: 'ɳ',
    category: 'consonant',
    label: 'Voiced retroflex nasal',
    words: ['Swedish "barn"'],
    audioPrompts: ['Voiced retroflex nasal']
  },
  {
    id: 'C018',
    symbol: 'ɲ',
    category: 'consonant',
    label: 'Voiced palatal nasal',
    words: ['Spanish "niño" (ñ)', 'French "peigne"'],
    audioPrompts: ['Voiced palatal nasal']
  },
  {
    id: 'C019',
    symbol: 'ŋ',
    category: 'consonant',
    label: 'Voiced velar nasal',
    words: ['sing', 'finger', 'sink'],
    audioPrompts: ['Voiced velar nasal (eng)']
  },
  {
    id: 'C020',
    symbol: 'ɴ',
    category: 'consonant',
    label: 'Voiced uvular nasal',
    words: ['Japanese "Nihon" (word-final)'],
    audioPrompts: ['Voiced uvular nasal']
  },
  {
    id: 'C021',
    symbol: 'ʙ',
    category: 'consonant',
    label: 'Voiced bilabial trill',
    words: ['shivering "brrr" sound'],
    audioPrompts: ['Voiced bilabial trill']
  },
  {
    id: 'C022',
    symbol: 'r',
    category: 'consonant',
    label: 'Voiced alveolar trill',
    words: ['Spanish "perro" (rolled r)'],
    audioPrompts: ['Voiced alveolar trill']
  },
  {
    id: 'C023',
    symbol: 'ʀ',
    category: 'consonant',
    label: 'Voiced uvular trill',
    words: ['French "r" (traditional stage/southern)'],
    audioPrompts: ['Voiced uvular trill']
  },
  {
    id: 'C024',
    symbol: 'ⱱ',
    category: 'consonant',
    label: 'Voiced labiodental flap',
    words: ['Mono "vwi"'],
    audioPrompts: ['Voiced labiodental flap']
  },
  {
    id: 'C025',
    symbol: 'ɾ',
    category: 'consonant',
    label: 'Voiced alveolar tap',
    words: ['butter (standard US English "tt")', 'Spanish "pero" (single r)'],
    audioPrompts: ['Voiced alveolar tap/flap']
  },
  {
    id: 'C026',
    symbol: 'ɽ',
    category: 'consonant',
    label: 'Voiced retroflex flap',
    words: ['Hindi "bada" (big)'],
    audioPrompts: ['Voiced retroflex flap']
  },
  {
    id: 'C027',
    symbol: 'ɸ',
    category: 'consonant',
    label: 'Voiceless bilabial fricative',
    words: ['blowing out a candle'],
    audioPrompts: ['Voiceless bilabial fricative']
  },
  {
    id: 'C028',
    symbol: 'β',
    category: 'consonant',
    label: 'Voiced bilabial fricative',
    words: ['Spanish "cabo" (b between vowels)'],
    audioPrompts: ['Voiced bilabial fricative']
  },
  {
    id: 'C029',
    symbol: 'f',
    category: 'consonant',
    label: 'Voiceless labiodental fricative',
    words: ['fan', 'coffee', 'leaf'],
    audioPrompts: ['The voiceless labiodental fricative sound f']
  },
  {
    id: 'C030',
    symbol: 'v',
    category: 'consonant',
    label: 'Voiced labiodental fricative',
    words: ['van', 'over', 'love'],
    audioPrompts: ['The voiced labiodental fricative sound v']
  },
  {
    id: 'C031',
    symbol: 'θ',
    category: 'consonant',
    label: 'Voiceless dental fricative',
    words: ['thin', 'author', 'path'],
    audioPrompts: ['The voiceless dental fricative sound theta']
  },
  {
    id: 'C032',
    symbol: 'ð',
    category: 'consonant',
    label: 'Voiced dental fricative',
    words: ['this', 'father', 'bathe'],
    audioPrompts: ['The voiced dental fricative sound eth']
  },
  {
    id: 'C033',
    symbol: 's',
    category: 'consonant',
    label: 'Voiceless alveolar fricative',
    words: ['sip', 'passing', 'hiss'],
    audioPrompts: ['Voiceless alveolar fricative s']
  },
  {
    id: 'C034',
    symbol: 'z',
    category: 'consonant',
    label: 'Voiced alveolar fricative',
    words: ['zip', 'lazy', 'buzz'],
    audioPrompts: ['Voiced alveolar fricative z']
  },
  {
    id: 'C037',
    symbol: 'ʂ',
    category: 'consonant',
    label: 'Voiceless retroflex fricative',
    words: ['Swedish "kust" (retroflex s)', 'Mandarin "shi"'],
    audioPrompts: ['Voiceless retroflex fricative']
  },
  {
    id: 'C038',
    symbol: 'ʐ',
    category: 'consonant',
    label: 'Voiced retroflex fricative',
    words: ['Russian "zhena" (wife)', 'Mandarin "ri"'],
    audioPrompts: ['Voiced retroflex fricative']
  },
  {
    id: 'C035',
    symbol: 'ʃ',
    category: 'consonant',
    label: 'Voiceless postalveolar fricative',
    words: ['she', 'ocean', 'rush'],
    audioPrompts: ['Voiceless postalveolar fricative esh']
  },
  {
    id: 'C036',
    symbol: 'ʒ',
    category: 'consonant',
    label: 'Voiced postalveolar fricative',
    words: ['measure', 'vision', 'beige'],
    audioPrompts: ['Voiced postalveolar fricative ezh']
  },
  {
    id: 'C039',
    symbol: 'ç',
    category: 'consonant',
    label: 'Voiceless palatal fricative',
    words: ['German "ich"'],
    audioPrompts: ['Voiceless palatal fricative']
  },
  {
    id: 'C040',
    symbol: 'ʝ',
    category: 'consonant',
    label: 'Voiced palatal fricative',
    words: ['Spanish "yema" (intense)'],
    audioPrompts: ['Voiced palatal fricative']
  },
  {
    id: 'C041',
    symbol: 'x',
    category: 'consonant',
    label: 'Voiceless velar fricative',
    words: ['German "ach"', 'Scottish English "loch"'],
    audioPrompts: ['Voiceless velar fricative chi']
  },
  {
    id: 'C042',
    symbol: 'ɣ',
    category: 'consonant',
    label: 'Voiced velar fricative',
    words: ['Spanish "fuego" (g between vowels)'],
    audioPrompts: ['Voiced velar fricative']
  },
  {
    id: 'C043',
    symbol: 'χ',
    category: 'consonant',
    label: 'Voiceless uvular fricative',
    words: ['French hard "r" (Parisian "j" sound-like)'],
    audioPrompts: ['Voiceless uvular fricative']
  },
  {
    id: 'C044',
    symbol: 'ʁ',
    category: 'consonant',
    label: 'Voiced uvular fricative',
    words: ['French standard "r" in "rouge"'],
    audioPrompts: ['Voiced uvular fricative']
  },
  {
    id: 'C045',
    symbol: 'ħ',
    category: 'consonant',
    label: 'Voiceless pharyngeal fricative',
    words: ['Arabic "Muhammad"'],
    audioPrompts: ['Voiceless pharyngeal fricative']
  },
  {
    id: 'C046',
    symbol: 'ʕ',
    category: 'consonant',
    label: 'Voiced pharyngeal fricative',
    words: ['Arabic "ʿayn"'],
    audioPrompts: ['Voiced pharyngeal fricative']
  },
  {
    id: 'C047',
    symbol: 'h',
    category: 'consonant',
    label: 'Voiceless glottal fricative',
    words: ['hat', 'ahead'],
    audioPrompts: ['Voiceless glottal fricative h']
  },
  {
    id: 'C048',
    symbol: 'ɦ',
    category: 'consonant',
    label: 'Voiced glottal fricative',
    words: ['ahead (sometimes voiced)', 'behind'],
    audioPrompts: ['Voiced glottal fricative']
  },
  {
    id: 'C049',
    symbol: 'ɬ',
    category: 'consonant',
    label: 'Voiceless alveolar lateral fricative',
    words: ['Welsh "Llan" (double l)'],
    audioPrompts: ['Voiceless alveolar lateral fricative']
  },
  {
    id: 'C050',
    symbol: 'ɮ',
    category: 'consonant',
    label: 'Voiced alveolar lateral fricative',
    words: ['Zulu "dlala" (to play)'],
    audioPrompts: ['Voiced alveolar lateral fricative']
  },
  {
    id: 'C051',
    symbol: 'ʋ',
    category: 'consonant',
    label: 'Voiced labiodental approximant',
    words: ['Dutch "w"', 'Finnish "v"'],
    audioPrompts: ['Voiced labiodental approximant']
  },
  {
    id: 'C052',
    symbol: 'ɹ',
    category: 'consonant',
    label: 'Voiced alveolar approximant',
    words: ['run', 'very (standard UK approx r)'],
    audioPrompts: ['Voiced alveolar approximant']
  },
  {
    id: 'C053',
    symbol: 'ɻ',
    category: 'consonant',
    label: 'Voiced retroflex approximant',
    words: ['run (standard US English "r")'],
    audioPrompts: ['Voiced retroflex approximant']
  },
  {
    id: 'C054',
    symbol: 'j',
    category: 'consonant',
    label: 'Voiced palatal approximant',
    words: ['yes', 'onion', 'beyond'],
    audioPrompts: ['Voiced palatal approximant (yod)']
  },
  {
    id: 'C055',
    symbol: 'ɰ',
    category: 'consonant',
    label: 'Voiced velar approximant',
    words: ['Spanish "agua" (very relaxed g)'],
    audioPrompts: ['Voiced velar approximant']
  },
  {
    id: 'C056',
    symbol: 'l',
    category: 'consonant',
    label: 'Voiced alveolar lateral approximant',
    words: ['let', 'fully', 'all'],
    audioPrompts: ['Voiced alveolar lateral approximant']
  },
  {
    id: 'C057',
    symbol: 'ɭ',
    category: 'consonant',
    label: 'Voiced retroflex lateral approximant',
    words: ['Swedish "sorl"'],
    audioPrompts: ['Voiced retroflex lateral approximant']
  },
  {
    id: 'C058',
    symbol: 'ʎ',
    category: 'consonant',
    label: 'Voiced palatal lateral approximant',
    words: ['Italian "figlio" (gl)', 'Spanish "ll" (some dialects)'],
    audioPrompts: ['Voiced palatal lateral approximant']
  },
  {
    id: 'C059',
    symbol: 'ʟ',
    category: 'consonant',
    label: 'Voiced velar lateral approximant',
    words: ['Melpa "pala" (velar lateral l)'],
    audioPrompts: ['Voiced velar lateral approximant']
  },
  {
    id: 'C060',
    symbol: 'ʘ',
    category: 'consonant',
    label: 'Voiceless bilabial click',
    words: ['kiss sound'],
    audioPrompts: ['Voiceless bilabial click']
  },
  {
    id: 'C061',
    symbol: 'ǀ',
    category: 'consonant',
    label: 'Voiceless dental click',
    words: ['tsk-tsk sound of disapproval'],
    audioPrompts: ['Voiceless dental click']
  },
  {
    id: 'C062',
    symbol: 'ǃ',
    category: 'consonant',
    label: 'Voiceless postalveolar click',
    words: ['toy horse galloping clip-clop sound'],
    audioPrompts: ['Voiceless postalveolar click']
  },
  {
    id: 'C063',
    symbol: 'ǂ',
    category: 'consonant',
    label: 'Voiceless palatoalveolar click',
    words: ['sharp, pop sound made behind teeth'],
    audioPrompts: ['Voiceless palatoalveolar click']
  },
  {
    id: 'C064',
    symbol: 'ǁ',
    category: 'consonant',
    label: 'Voiceless alveolar lateral click',
    words: ['horse-clicking encouragement sound (on side)'],
    audioPrompts: ['Voiceless alveolar lateral click']
  },
  {
    id: 'C065',
    symbol: 'ɓ',
    category: 'consonant',
    label: 'Voiced bilabial implosive',
    words: ['Hausa "ɓere" (to shell)'],
    audioPrompts: ['Voiced bilabial implosive']
  },
  {
    id: 'C066',
    symbol: 'ɗ',
    category: 'consonant',
    label: 'Voiced alveolar implosive',
    words: ['Hausa "ɗa" (son)'],
    audioPrompts: ['Voiced alveolar implosive']
  },
  {
    id: 'C067',
    symbol: 'ʄ',
    category: 'consonant',
    label: 'Voiced palatal implosive',
    words: ['Sindhi "ʄat-u" (illiterate)'],
    audioPrompts: ['Voiced palatal implosive']
  },
  {
    id: 'C068',
    symbol: 'ɠ',
    category: 'consonant',
    label: 'Voiced velar implosive',
    words: ['Sindhi "ɠaru" (heavy)'],
    audioPrompts: ['Voiced velar implosive']
  },
  {
    id: 'C069',
    symbol: 'ʛ',
    category: 'consonant',
    label: 'Voiced uvular implosive',
    words: ['Mam "ʛoba" (water)'],
    audioPrompts: ['Voiced uvular implosive']
  },
  {
    id: 'C070',
    symbol: 'ʍ',
    category: 'consonant',
    label: 'Voiceless labial-velar fricative',
    words: ['traditional pronunciation of "which" vs "witch"'],
    audioPrompts: ['Voiceless labial-velar fricative']
  },
  {
    id: 'C071',
    symbol: 'w',
    category: 'consonant',
    label: 'Voiced labial-velar approximant',
    words: ['wet', 'away', 'always'],
    audioPrompts: ['Voiced labial-velar approximant']
  },
  {
    id: 'C072',
    symbol: 'ɥ',
    category: 'consonant',
    label: 'Voiced labial-palatal approximant',
    words: ['French "huit"'],
    audioPrompts: ['Voiced labial-palatal approximant']
  },
  {
    id: 'C073',
    symbol: 'ʜ',
    category: 'consonant',
    label: 'Voiceless epiglottal fricative',
    words: ['Agul "ʜat" (dry)'],
    audioPrompts: ['Voiceless epiglottal fricative']
  },
  {
    id: 'C074',
    symbol: 'ʢ',
    category: 'consonant',
    label: 'Voiced epiglottal fricative',
    words: ['Arabic epiglottal realization'],
    audioPrompts: ['Voiced epiglottal fricative']
  },
  {
    id: 'C075',
    symbol: 'ʡ',
    category: 'consonant',
    label: 'Voiceless epiglottal plosive',
    words: ['Amis "ʡem" (dense)'],
    audioPrompts: ['Voiceless epiglottal plosive']
  },
  {
    id: 'C076',
    symbol: 'ɕ',
    category: 'consonant',
    label: 'Voiceless alveolo-palatal fricative',
    words: ['Swedish "sj-sound" (some dialects)', 'Mandarin "xi"'],
    audioPrompts: ['Voiceless alveolo-palatal fricative']
  },
  {
    id: 'C077',
    symbol: 'ʑ',
    category: 'consonant',
    label: 'Voiced alveolo-palatal fricative',
    words: ['Polish "źrebię" (foal)'],
    audioPrompts: ['Voiced alveolo-palatal fricative']
  },
  {
    id: 'C078',
    symbol: 'ɺ',
    category: 'consonant',
    label: 'Voiced alveolar lateral flap',
    words: ['Japanese "r" (often lateral flap realization)'],
    audioPrompts: ['Voiced alveolar lateral flap']
  },

  // VOWELS
  {
    id: 'V079',
    symbol: 'i',
    category: 'vowel',
    label: 'Close front unrounded vowel',
    words: ['see', 'heat', 'receive'],
    audioPrompts: ['The close front unrounded vowel sound i', 'Pronounce i as in see']
  },
  {
    id: 'V080',
    symbol: 'y',
    category: 'vowel',
    label: 'Close front rounded vowel',
    words: ['French "tu"', 'German "über"'],
    audioPrompts: ['Close front rounded vowel']
  },
  {
    id: 'V081',
    symbol: 'ɪ',
    category: 'vowel',
    label: 'Near-close near-front unrounded vowel',
    words: ['bit', 'silly', 'injury'],
    audioPrompts: ['Near-close near-front unrounded vowel']
  },
  {
    id: 'V082',
    symbol: 'ʏ',
    category: 'vowel',
    label: 'Near-close near-front rounded vowel',
    words: ['German "hübsch"', 'Swedish "lynne"'],
    audioPrompts: ['Near-close near-front rounded vowel']
  },
  {
    id: 'V083',
    symbol: 'e',
    category: 'vowel',
    label: 'Close-mid front unrounded vowel',
    words: ['French "café"', 'Spanish "bebé"'],
    audioPrompts: ['Close-mid front unrounded vowel']
  },
  {
    id: 'V084',
    symbol: 'ø',
    category: 'vowel',
    label: 'Close-mid front rounded vowel',
    words: ['French "feu"', 'German "schön"'],
    audioPrompts: ['Close-mid front rounded vowel']
  },
  {
    id: 'V085',
    symbol: 'ɛ',
    category: 'vowel',
    label: 'Open-mid front unrounded vowel',
    words: ['bet', 'head', 'many'],
    audioPrompts: ['Open-mid front unrounded vowel']
  },
  {
    id: 'V086',
    symbol: 'œ',
    category: 'vowel',
    label: 'Open-mid front rounded vowel',
    words: ['French "jeune"', 'German "Hölle"'],
    audioPrompts: ['Open-mid front rounded vowel']
  },
  {
    id: 'V087',
    symbol: 'æ',
    category: 'vowel',
    label: 'Near-open front unrounded vowel',
    words: ['bat', 'laugh', 'had'],
    audioPrompts: ['Near-open front unrounded vowel']
  },
  {
    id: 'V088',
    symbol: 'a',
    category: 'vowel',
    label: 'Open front unrounded vowel',
    words: ['Spanish "casa"', 'French "patte"'],
    audioPrompts: ['Open front unrounded vowel']
  },
  {
    id: 'V089',
    symbol: 'ɶ',
    category: 'vowel',
    label: 'Open front rounded vowel',
    words: ['Bavarian "Såst" (some dialects)'],
    audioPrompts: ['Open front rounded vowel']
  },
  {
    id: 'V090',
    symbol: 'ɨ',
    category: 'vowel',
    label: 'Close central unrounded vowel',
    words: ['Russian "było"', 'Welsh "tyn"'],
    audioPrompts: ['Close central unrounded vowel']
  },
  {
    id: 'V091',
    symbol: 'ʉ',
    category: 'vowel',
    label: 'Close central rounded vowel',
    words: ['Swedish "ut"', 'Norwegian "hus"'],
    audioPrompts: ['Close central rounded vowel']
  },
  {
    id: 'V092',
    symbol: 'ɘ',
    category: 'vowel',
    label: 'Close-mid central unrounded vowel',
    words: ['Australian English "mate" second part'],
    audioPrompts: ['Close-mid central unrounded vowel']
  },
  {
    id: 'V093',
    symbol: 'ɵ',
    category: 'vowel',
    label: 'Close-mid central rounded vowel',
    words: ['Swedish "dur" (central realization)'],
    audioPrompts: ['Close-mid central rounded vowel']
  },
  {
    id: 'V094',
    symbol: 'ə',
    category: 'vowel',
    label: 'Mid central unrounded vowel',
    words: ['about (first syllable)', 'sofa (last syllable)'],
    audioPrompts: ['The mid central unrounded vowel (schwa)']
  },
  {
    id: 'V095',
    symbol: 'ɜ',
    category: 'vowel',
    label: 'Open-mid central unrounded vowel',
    words: ['bird', 'word (standard British RP)'],
    audioPrompts: ['Open-mid central unrounded vowel']
  },
  {
    id: 'V096',
    symbol: 'ɞ',
    category: 'vowel',
    label: 'Open-mid central rounded vowel',
    words: ['Irish "tomhas" (some dialects)'],
    audioPrompts: ['Open-mid central rounded vowel']
  },
  {
    id: 'V097',
    symbol: 'ɐ',
    category: 'vowel',
    label: 'Near-open central unrounded vowel',
    words: ['butter (standard British RP last syllable)'],
    audioPrompts: ['Near-open central unrounded vowel']
  },
  {
    id: 'V098',
    symbol: 'ɯ',
    category: 'vowel',
    label: 'Close back unrounded vowel',
    words: ['Korean "eum" (으)', 'Turkish "ılık"'],
    audioPrompts: ['Close back unrounded vowel']
  },
  {
    id: 'V099',
    symbol: 'u',
    category: 'vowel',
    label: 'Close back rounded vowel',
    words: ['too', 'blue', 'group'],
    audioPrompts: ['The close back rounded vowel sound u']
  },
  {
    id: 'V100',
    symbol: 'ʊ',
    category: 'vowel',
    label: 'Near-close near-back rounded vowel',
    words: ['put', 'could', 'foot'],
    audioPrompts: ['Near-close near-back rounded vowel']
  },
  {
    id: 'V101',
    symbol: 'ɤ',
    category: 'vowel',
    label: 'Close-mid back unrounded vowel',
    words: ['Mandarin "ge" (brother)', 'Irish "Uladh"'],
    audioPrompts: ['Close-mid back unrounded vowel']
  },
  {
    id: 'V102',
    symbol: 'o',
    category: 'vowel',
    label: 'Close-mid back rounded vowel',
    words: ['French "eau"', 'Spanish "ojo"'],
    audioPrompts: ['Close-mid back rounded vowel']
  },
  {
    id: 'V103',
    symbol: 'ʌ',
    category: 'vowel',
    label: 'Open-mid back unrounded vowel',
    words: ['but', 'tough', 'son'],
    audioPrompts: ['Open-mid back unrounded vowel (wedge / caret)']
  },
  {
    id: 'V104',
    symbol: 'ɔ',
    category: 'vowel',
    label: 'Open-mid back rounded vowel',
    words: ['bought', 'saw', 'caught'],
    audioPrompts: ['Open-mid back rounded vowel']
  },
  {
    id: 'V105',
    symbol: 'ɑ',
    category: 'vowel',
    label: 'Open back unrounded vowel',
    words: ['father', 'bra', 'calm'],
    audioPrompts: ['Open back unrounded vowel (script a)']
  },
  {
    id: 'V106',
    symbol: 'ɒ',
    category: 'vowel',
    label: 'Open back rounded vowel',
    words: ['lot', 'bother', 'wash (standard UK English)'],
    audioPrompts: ['Open back rounded vowel']
  },

  // DIACRITICS
  {
    id: 'D107',
    symbol: '̥',
    category: 'diacritic',
    label: 'voiceless',
    words: ['Applied to voiced symbols (e.g., d̥, n̥) to mean unvoiced']
  },
  {
    id: 'D108',
    symbol: '̬',
    category: 'diacritic',
    label: 'voiced',
    words: ['Applied to voiceless symbols (e.g., s̬, t̬) to mean voiced']
  },
  {
    id: 'D109',
    symbol: 'ʰ',
    category: 'diacritic',
    label: 'aspirated',
    words: ['Breath release (e.g., tʰ, pʰ)']
  },
  {
    id: 'D110',
    symbol: '̹',
    category: 'diacritic',
    label: 'more rounded',
    words: ['Pronounced with more lip rounding (e.g., ɔ̹)']
  },
  {
    id: 'D111',
    symbol: '̜',
    category: 'diacritic',
    label: 'less rounded',
    words: ['Pronounced with less lip rounding (e.g., ɔ̜)']
  },
  {
    id: 'D112',
    symbol: '̟',
    category: 'diacritic',
    label: 'advanced',
    words: ['Pronounced further forward in the mouth (e.g., u̟)']
  },
  {
    id: 'D113',
    symbol: '̠',
    category: 'diacritic',
    label: 'retracted',
    words: ['Pronounced further back in the mouth (e.g., e̠)']
  },
  {
    id: 'D114',
    symbol: '̈',
    category: 'diacritic',
    label: 'centralized',
    words: ['Pronounced closer to the center of the vowel space (e.g., ë)']
  },
  {
    id: 'D115',
    symbol: '̽',
    category: 'diacritic',
    label: 'mid-centralized',
    words: ['Pronounced closer to mid-central schwa (e.g., e̽)']
  },
  {
    id: 'D116',
    symbol: '̩',
    category: 'diacritic',
    label: 'syllabic',
    words: ['Acts as a syllable nucleus without a vowel (e.g., n̩, l̩)']
  },
  {
    id: 'D117',
    symbol: '̯',
    category: 'diacritic',
    label: 'non-syllabic',
    words: ['Vowel made brief, behaves like glide (e.g., e̯)']
  },
  {
    id: 'D118',
    symbol: '˞',
    category: 'diacritic',
    label: 'rhoticity',
    words: ['"r-colored" vowel quality (e.g., ə˞, ɚ)']
  },
  {
    id: 'D119',
    symbol: '̤',
    category: 'diacritic',
    label: 'breathy voiced',
    words: ['Breathy voice quality / murmur (e.g., b̤, a̤)']
  },
  {
    id: 'D120',
    symbol: '̰',
    category: 'diacritic',
    label: 'creaky voiced',
    words: ['Vocal fry / creaky voice quality (e.g., a̰, b̰)']
  },
  {
    id: 'D121',
    symbol: '̼',
    category: 'diacritic',
    label: 'linguolabial',
    words: ['Tongue tip touches upper lip (e.g., t̼, d̼)']
  },
  {
    id: 'D122',
    symbol: 'ʷ',
    category: 'diacritic',
    label: 'labialized',
    words: ['Lip rounding secondary articulation (e.g., tʷ, dʷ)']
  },
  {
    id: 'D123',
    symbol: 'ʲ',
    category: 'diacritic',
    label: 'palatalized',
    words: ['Raising body of tongue to hard palate (e.g., tʲ, dʲ)']
  },
  {
    id: 'D124',
    symbol: 'ˠ',
    category: 'diacritic',
    label: 'velarized',
    words: ['Raising back of tongue toward soft palate (e.g., tˠ, dˠ)']
  },
  {
    id: 'D125',
    symbol: 'ˤ',
    category: 'diacritic',
    label: 'pharyngealized',
    words: ['Retracting tongue root toward pharyngeal wall (e.g., tˤ, dˤ)']
  },
  {
    id: 'D126',
    symbol: '̴',
    category: 'diacritic',
    label: 'velarized or pharyngealized',
    words: ['General velarization or pharyngealization (e.g., l̴)']
  },
  {
    id: 'D127',
    symbol: '̝',
    category: 'diacritic',
    label: 'raised',
    words: ['Pronounced with a higher position (e.g., e̝ is higher than e)']
  },
  {
    id: 'D128',
    symbol: '̞',
    category: 'diacritic',
    label: 'lowered',
    words: ['Pronounced with a lower position (e.g., e̞ is lower than e)']
  },
  {
    id: 'D129',
    symbol: '̘',
    category: 'diacritic',
    label: 'advanced tongue root',
    words: ['Tongue root is pushed forward (e.g., e̘)']
  },
  {
    id: 'D130',
    symbol: '̙',
    category: 'diacritic',
    label: 'retracted tongue root',
    words: ['Tongue root is pulled backward (e.g., e̙)']
  },
  {
    id: 'D131',
    symbol: '̪',
    category: 'diacritic',
    label: 'dental',
    words: ['Tongue tip contacts upper teeth (e.g., t̪, d̪)']
  },
  {
    id: 'D132',
    symbol: '̺',
    category: 'diacritic',
    label: 'apical',
    words: ['Pronounced with the tip of the tongue (e.g., t̺, d̺)']
  },
  {
    id: 'D133',
    symbol: '̻',
    category: 'diacritic',
    label: 'laminal',
    words: ['Pronounced with the blade of the tongue (e.g., t̻, d̻)']
  },
  {
    id: 'D134',
    symbol: '̃',
    category: 'diacritic',
    label: 'nasalized',
    words: ['Pronounced with lower velum, air passes through nose (e.g., ẽ, ã)']
  },
  {
    id: 'D135',
    symbol: 'ⁿ',
    category: 'diacritic',
    label: 'nasal release',
    words: ['Released with nasal burst (e.g., dⁿ)']
  },
  {
    id: 'D136',
    symbol: 'ˡ',
    category: 'diacritic',
    label: 'lateral release',
    words: ['Released on one or both sides of the tongue (e.g., dˡ)']
  },
  {
    id: 'D137',
    symbol: '̚',
    category: 'diacritic',
    label: 'no audible release',
    words: ['Plosive closure with no active opening burst (e.g., d̚, p̚)']
  },
  {
    id: 'D138',
    symbol: 'ʼ',
    category: 'diacritic',
    label: 'ejective',
    words: ['Glottalic egressive consonant (e.g., pʼ, tʼ, kʼ)']
  },
  {
    id: 'D139',
    symbol: 'ˈ',
    category: 'diacritic',
    label: 'primary stress',
    words: ['Placed before the syllable with main stress']
  },
  {
    id: 'D140',
    symbol: 'ˌ',
    category: 'diacritic',
    label: 'secondary stress',
    words: ['Placed before the syllable with secondary stress']
  },
  {
    id: 'D141',
    symbol: 'ː',
    category: 'diacritic',
    label: 'long',
    words: ['Enlarges duration / long vowel or consonant (e.g., aː, sː)']
  },
  {
    id: 'D142',
    symbol: 'ˑ',
    category: 'diacritic',
    label: 'half-long',
    words: ['Intermediate duration scale (e.g., aˑ)']
  },
  {
    id: 'D143',
    symbol: '˘',
    category: 'diacritic',
    label: 'extra-short',
    words: ['Syllable made extra brief / transient (e.g., a˘)']
  },
  {
    id: 'D147A',
    symbol: '͡',
    category: 'diacritic',
    label: 'tie bar (above)',
    words: ['Affricates or coarticulations (e.g., t͡s)']
  },
  {
    id: 'D147B',
    symbol: '͜',
    category: 'diacritic',
    label: 'tie bar (below)',
    words: ['Affricates or coarticulations (e.g., t͜s)']
  },
  {
    id: 'D148',
    symbol: '̋',
    category: 'diacritic',
    label: 'extra high tone',
    words: ['Tone contour indicator (high level)']
  },
  {
    id: 'D150',
    symbol: '́',
    category: 'diacritic',
    label: 'high tone',
    words: ['High level tone mark']
  },
  {
    id: 'D152',
    symbol: '̄',
    category: 'diacritic',
    label: 'mid tone',
    words: ['Mid level tone mark']
  },
  {
    id: 'D154',
    symbol: '̀',
    category: 'diacritic',
    label: 'low tone',
    words: ['Low level tone mark']
  },
  {
    id: 'D156',
    symbol: '̏',
    category: 'diacritic',
    label: 'extra low tone',
    words: ['Extra low level tone mark']
  },
  {
    id: 'D158',
    symbol: '̌',
    category: 'diacritic',
    label: 'rising tone',
    words: ['Rising tone contour character']
  },
  {
    id: 'D160',
    symbol: '̂',
    category: 'diacritic',
    label: 'falling tone',
    words: ['Falling tone contour character']
  },
  {
    id: 'D162',
    symbol: '᷄',
    category: 'diacritic',
    label: 'high rising tone',
    words: ['High-pitched rising pitch contour']
  },
  {
    id: 'D164',
    symbol: '᷅',
    category: 'diacritic',
    label: 'low rising tone',
    words: ['Low-pitched rising pitch contour']
  },
  {
    id: 'D166',
    symbol: '᷈',
    category: 'diacritic',
    label: 'rising-falling tone',
    words: ['Peaked rising-falling tone contour']
  }
];
