/*
 * Dependency-free regression suite for IPA365 v1.1.0-preview.9.
 * Run with `npm test` (Node 20+). No build, DOM, network, or file writes.
 * Rendering checks use real React SSR; they do not claim to test browser layout,
 * font shaping, pointer interactions, or pronunciation quality by ear.
 */
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '1.1.0-preview.9';
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');
const audioFilenames = fs.readdirSync(AUDIO_DIR)
  .filter(name => name.toLowerCase().endsWith('.mp3')).sort();
const readSource = filename => fs.readFileSync(path.join(ROOT, filename), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const sequence = (prefix, first, last) => Array.from(
  { length: last - first + 1 }, (_, index) => `${prefix}${String(first + index).padStart(3, '0')}`,
);

/** An isolated CommonJS loader: TS/TSX stay in memory and CSS is a no-op. */
function makeLoader({ globals = {}, externals = {}, logger = console } = {}) {
  const modules = new Map();
  const context = vm.createContext({
    console: logger, Buffer, URL, URLSearchParams,
    setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
    __APP_VERSION__: VERSION,
    __BUNDLED_AUDIO_FILES__: [...audioFilenames],
    ...globals,
  });

  function load(filename) {
    filename = path.resolve(ROOT, filename);
    const candidates = [filename, `${filename}.ts`, `${filename}.tsx`,
      path.join(filename, 'index.ts'), path.join(filename, 'index.tsx')];
    filename = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    assert.ok(filename, `Cannot resolve local module: ${candidates[0]}`);
    if (filename.endsWith('.css')) return {};
    if (!/\.tsx?$/.test(filename)) return createRequire(filename)(filename);
    if (modules.has(filename)) return modules.get(filename).exports;

    const module = { exports: {} };
    modules.set(filename, module);
    const source = fs.readFileSync(filename, 'utf8')
      .replace(/\bimport\.meta\.env\b/g, '({ BASE_URL: "./", DEV: false, PROD: true, MODE: "production" })')
      .replace(/\bimport\.meta\.url\b/g, JSON.stringify(pathToFileURL(filename).href));
    const result = ts.transpileModule(source, {
      fileName: filename,
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    });
    const errors = (result.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n')).join('\n'));
    const hostRequire = createRequire(filename);
    const localRequire = specifier => {
      if (Object.prototype.hasOwnProperty.call(externals, specifier)) return externals[specifier];
      if (specifier.endsWith('.css')) return {};
      return specifier.startsWith('.')
        ? load(path.resolve(path.dirname(filename), specifier))
        : hostRequire(specifier);
    };
    try {
      const execute = vm.runInContext(
        `(function (exports, require, module, __filename, __dirname) {\n${result.outputText}\n})`,
        context, { filename },
      );
      execute(module.exports, localRequire, module, filename, path.dirname(filename));
    } catch (error) {
      modules.delete(filename);
      throw error;
    }
    return module.exports;
  }
  return load;
}

const load = makeLoader();
const { ipaDataset } = load('data/ipaData.ts');
const { additionalToneCards } = load('data/toneData.ts');
const { KEYBOARD_GROUPS, IPAKeyboard } = load('components/IPAKKeyboard.tsx');
const { IPAFeature } = load('types.ts');
const { gradeQuizAnswer } = load('services/quizGrading.ts');
const { DiacriticExample } = load('components/DiacriticExample.tsx');
const { AudioButton } = load('components/AudioButton.tsx');
const { Flashcard } = load('components/Flashcard.tsx');
const { FoldedCard } = load('components/FoldedCard.tsx');
const chart = load('data/chartData.ts');
const byId = new Map(ipaDataset.map(card => [card.id, card]));
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));
const noop = () => {};

// Verified read-only against data/ipaData.ts inside
// .backups/IPA365-v1.0.0-pre-chart-2026-10-30.zip. Embed the snapshot so CI
// does not depend on a private backup or on a ZIP package/external extractor.
const originalConsonants = 'p b t d ʈ ɖ c ɟ k ɡ q ɢ ʔ m ɱ n ɳ ɲ ŋ ɴ ʙ r ʀ ⱱ ɾ ɽ ɸ β f v θ ð s z ʃ ʒ ʂ ʐ ç ʝ x ɣ χ ʁ ħ ʕ h ɦ ɬ ɮ ʋ ɹ ɻ j ɰ l ɭ ʎ ʟ ʘ ǀ ǃ ǂ ǁ ɓ ɗ ʄ ɠ ʛ ʍ w ɥ ʜ ʢ ʡ ɕ ʑ ɺ'.split(' ');
const originalVowels = 'i y ɪ ʏ e ø ɛ œ æ a ɶ ɨ ʉ ɘ ɵ ə ɜ ɞ ɐ ɯ u ʊ ɤ o ʌ ɔ ɑ ɒ'.split(' ');
const originalDiacritics = {
  D107: '\u0325', D108: '\u032c', D109: 'ʰ', D110: '\u0339', D111: '\u031c',
  D112: '\u031f', D113: '\u0320', D114: '\u0308', D115: '\u033d', D116: '\u0329',
  D117: '\u032f', D118: '˞', D119: '\u0324', D120: '\u0330', D121: '\u033c',
  D122: 'ʷ', D123: 'ʲ', D124: 'ˠ', D125: 'ˤ', D126: '\u0334',
  D127: '\u031d', D128: '\u031e', D129: '\u0318', D130: '\u0319', D131: '\u032a',
  D132: '\u033a', D133: '\u033b', D134: '\u0303', D135: 'ⁿ', D136: 'ˡ',
  D137: '\u031a', D138: 'ʼ', D139: 'ˈ', D140: 'ˌ', D141: 'ː', D142: 'ˑ', D143: '˘',
  D147A: '\u0361', D147B: '\u035c', D148: '\u030b', D150: '\u0301', D152: '\u0304',
  D154: '\u0300', D156: '\u030f', D158: '\u030c', D160: '\u0302',
  D162: '\u1dc4', D164: '\u1dc5', D166: '\u1dc8',
};
const baselineSymbols = {
  ...Object.fromEntries(sequence('C', 1, 78).map((id, index) => [id, originalConsonants[index]])),
  ...Object.fromEntries(sequence('V', 79, 106).map((id, index) => [id, originalVowels[index]])),
  ...originalDiacritics,
};
const newToneSymbols = {
  D167: '˥', D168: '˦', D169: '˧', D170: '˨', D171: '˩',
  D172: '˩˥', D173: '˥˩', D174: '˧˥', D175: '˩˧', D176: '˧˦˨',
  D177: '↗', D178: '↘',
};
const chartOnlySymbols = { C079: 'ɧ', C080: 'pʼ', C081: 'tʼ', C082: 'kʼ', C083: 'sʼ' }; // IDs retained from preview.1.

describe('Study dataset and keyboard coverage', () => {
  test('172 cards have unique, nonempty IDs and exact Unicode symbols', () => {
    assert.equal(ipaDataset.length, 172);
    assert.equal(byId.size, 172);
    assert.equal(new Set(ipaDataset.map(card => card.symbol)).size, 172);
    for (const card of ipaDataset) {
      assert.ok(card.id && card.symbol && card.label, card.id);
      assert.ok(['consonant', 'vowel', 'diacritic'].includes(card.category), card.id);
    }
    assert.deepEqual(plain(Object.fromEntries(['consonant', 'vowel', 'diacritic'].map(category => [
      category, ipaDataset.filter(card => card.category === category).length,
    ]))), { consonant: 83, vowel: 28, diacritic: 61 });
  });

  test('all 155 baseline IDs still identify exactly the same Unicode symbols', () => {
    assert.equal(Object.keys(baselineSymbols).length, 155);
    assert.equal(originalConsonants.length, 78);
    assert.equal(originalVowels.length, 28);
    for (const [id, symbol] of Object.entries(baselineSymbols)) {
      assert.equal(byId.get(id)?.symbol, symbol, `Saved progress must still identify ${id}`);
    }
    assert.deepEqual(plain(ipaDataset.map(card => card.id).sort()), Object.keys({ ...baselineSymbols, ...newToneSymbols, ...chartOnlySymbols }).sort());
  });

  test('requested tones and five promoted consonants enter the study deck, preserving the ejective mark', () => {
    assert.deepEqual(plain(Object.fromEntries(additionalToneCards.map(card => [card.id, card.symbol]))), newToneSymbols);
    assert.equal(additionalToneCards.length, 12);
    for (const [id, symbol] of Object.entries(newToneSymbols)) {
      assert.equal(byId.get(id)?.symbol, symbol);
      assert.equal(byId.get(id)?.category, 'diacritic');
    }
    for (const [id, symbol] of Object.entries(chartOnlySymbols)) {
      assert.equal(byId.get(id)?.symbol, symbol);
      assert.equal(byId.get(id)?.category, 'consonant');
    }
    assert.equal(byId.get('D138').symbol, 'ʼ');
    assert.equal(byId.get('D138').category, 'diacritic');
  });

  test('keyboard contains every study symbol, including all five promoted consonants', () => {
    const keys = new Set(Object.values(KEYBOARD_GROUPS).flat().map(symbol => symbol.replace(/^◌/, '')));
    for (const symbol of [...ipaDataset.map(card => card.symbol), ...Object.values(chartOnlySymbols)]) {
      assert.ok(keys.has(symbol), `Missing keyboard button: ${JSON.stringify(symbol)}`);
    }
    for (const [group, symbols] of Object.entries(KEYBOARD_GROUPS)) {
      assert.equal(new Set(symbols).size, symbols.length, `${group} has duplicate buttons`);
    }
  });

  test('rendered keyboard exposes mark-only tone/arrow and promoted consonant buttons', () => {
    for (const group of ['Consonants', 'Diacritics']) {
      const markup = render(IPAKeyboard, { value: '', onChange: noop, group, onGroupChange: noop });
      const required = group === 'Diacritics' ? Object.values(newToneSymbols) : Object.values(chartOnlySymbols);
      for (const symbol of required) assert.ok(markup.includes(`aria-label="Insert ${symbol}"`), symbol);
    }
  });
});

function decodeEntities(value) {
  return value.replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex, decimal) => String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10)))
    .replace(/&quot;/g, '"').replace(/&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
const textContent = markup => decodeEntities(markup.replace(/<[^>]*>/g, ''));
const leafSpans = markup => [...markup.matchAll(/<span\b([^>]*)>([^<]*)<\/span>/g)]
  .map(match => ({ attributes: match[1], text: decodeEntities(match[2]) }));
const buttons = markup => [...markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
  .map(match => ({ attributes: match[1], content: match[2] }));

describe('Diacritic rendering contracts (React SSR, not visual font QA)', () => {
  test('all ten Chao tones/contours render grey a + dark actual mark in the IPA font', () => {
    for (const symbol of Object.values(newToneSymbols).slice(0, 10)) {
      const markup = render(DiacriticExample, { symbol });
      assert.match(markup, /class="[^"]*\bipa-font\b/);
      assert.equal(textContent(markup), `a${symbol}`);
      const spans = leafSpans(markup);
      assert.ok(spans.some(span => span.text === 'a' && /color:#cbd5e1(?:;|")/.test(span.attributes)), `Grey carrier: ${symbol}`);
      assert.ok(spans.some(span => span.text === symbol && /color:#1e293b(?:;|")/.test(span.attributes)), `Dark mark: ${symbol}`);
      assert.ok(!textContent(markup).includes('◌'));
    }
  });

  test('global rise/fall are standalone arrows with no illustrative vowel', () => {
    for (const symbol of ['↗', '↘']) {
      const markup = render(DiacriticExample, { symbol });
      assert.equal(textContent(markup), symbol);
      assert.match(markup, /class="[^"]*\bipa-font\b/);
      assert.doesNotMatch(markup, /color:#cbd5e1/);
    }
  });

  test('Doulos SIL is bundled and selected by the shared IPA font class', () => {
    const html = readSource('index.html');
    assert.match(html, /@font-face\s*\{[^}]*font-family:\s*['"]Doulos SIL['"]/);
    assert.match(html, /\.ipa-font\s*\{[^}]*font-family:\s*['"]Doulos SIL['"]/);
    assert.match(html, /url\(['"]\.\/fonts\/DoulosSIL-Regular\.woff2['"]\)/);
    const font = fs.readFileSync(path.join(ROOT, 'public/fonts/DoulosSIL-Regular.woff2'));
    assert.equal(font.subarray(0, 4).toString('ascii'), 'wOF2');
    assert.ok(font.length > 1000);
  });
});

function assertGrade(card, input, feature, score) {
  const result = gradeQuizAnswer(card, input, feature);
  assert.equal(result.score, score, `${card.id} ${feature}: ${JSON.stringify(input)}`);
  assert.equal(result.feedback, score === 1 ? 'correct' : score === 0.5 ? 'partial' : 'incorrect');
}

describe('Quiz grading', () => {
  test('every study symbol, including every new tone/arrow, earns one for an exact answer', () => {
    for (const card of ipaDataset) assertGrade(card, card.symbol, IPAFeature.SYMBOL, 1);
  });

  test('different new tones/arrows cannot earn full or partial marks through shared label words', () => {
    for (const card of additionalToneCards) {
      for (const other of additionalToneCards) {
        if (card.id !== other.id) assertGrade(card, other.symbol, IPAFeature.SYMBOL, 0);
      }
      assertGrade(card, `a${card.symbol}`, IPAFeature.SYMBOL, 0);
      assertGrade(card, card.label, IPAFeature.LABEL, 1);
    }
  });

  test('long and half-long marks remain distinct, not stripped into an empty exact match', () => {
    assertGrade(byId.get('D141'), 'ˑ', IPAFeature.SYMBOL, 0);
    assertGrade(byId.get('D142'), 'ː', IPAFeature.SYMBOL, 0);
    for (const id of ['D141', 'D142']) assertGrade(byId.get(id), '', IPAFeature.SYMBOL, 0);
  });

  test('aspiration ʰ is not normalised into ASCII h', () => {
    assertGrade(byId.get('D109'), 'ʰ', IPAFeature.SYMBOL, 1);
    assertGrade(byId.get('D109'), 'h', IPAFeature.SYMBOL, 0);
    assertGrade(byId.get('C047'), 'ʰ', IPAFeature.SYMBOL, 0);
  });

  test('the velar plosive remains ɡ, accepting ordinary keyboard g as equivalent', () => {
    assert.equal(byId.get('C010').symbol, 'ɡ');
    for (const input of ['ɡ', 'g', ' g ']) {
      assertGrade(byId.get('C010'), input, IPAFeature.SYMBOL, 1);
      assertGrade(byId.get('C010'), input, IPAFeature.LABEL, 1);
    }
  });

  test('all existing consonant/vowel labels still earn full credit', () => {
    for (const card of ipaDataset.filter(item => item.category !== 'diacritic')) {
      assertGrade(card, card.label, IPAFeature.LABEL, 1);
      assertGrade(card, card.symbol, IPAFeature.LABEL, 1);
    }
  });

  test('existing two-label partial credit is preserved for consonants and vowels', () => {
    for (const [target, answer] of [['C001', 'C002'], ['V079', 'V080'], ['V092', 'V093']]) {
      assertGrade(byId.get(target), byId.get(answer).symbol, IPAFeature.SYMBOL, 0.5);
      assertGrade(byId.get(target), byId.get(answer).label, IPAFeature.LABEL, 0.5);
      assertGrade(byId.get(target), byId.get(answer).symbol, IPAFeature.LABEL, 0.5);
    }
    assertGrade(byId.get('C001'), 'ɡ', IPAFeature.SYMBOL, 0);
    assertGrade(byId.get('V079'), 'p', IPAFeature.SYMBOL, 0);
  });

  test('supporting examples are not quiz targets and blank answers earn nothing', () => {
    const card = byId.get('C001');
    assertGrade(card, 'pat', IPAFeature.EXAMPLES, 0);
    for (const feature of [IPAFeature.SYMBOL, IPAFeature.LABEL]) assertGrade(card, '   ', feature, 0);
  });
});

function audioHarness({ immediate = false, throws = false } = {}) {
  const instances = [];
  const warnings = [];
  class FakeAudio {
    constructor(src) {
      if (throws) throw new Error('Audio constructor unavailable');
      this.src = src;
      this.currentTime = 0;
      this.paused = true;
      this.pauseCalls = 0;
      this.playCalls = 0;
      this.onended = null;
      instances.push(this);
    }
    play() {
      this.playCalls++;
      if (immediate) { this.paused = false; return Promise.resolve(); }
      return new Promise((resolve, reject) => {
        // Deliberately simulate a browser's late play completion after pause().
        this.resolvePlay = () => { this.paused = false; resolve(); };
        this.rejectPlay = () => reject(new Error('Playback blocked'));
      });
    }
    pause() { this.pauseCalls++; this.paused = true; }
  }
  const service = makeLoader({
    globals: { Audio: FakeAudio },
    logger: { ...console, warn: (...args) => warnings.push(args) },
  })('services/audioService.ts');
  return { service, instances, warnings };
}

describe('Bundled audio availability and URLs', () => {
  test('the 111 generated names match all actual C001–C083 and V079–V106 MP3s', () => {
    const expectedIds = [...sequence('C', 1, 83), ...sequence('V', 79, 106)];
    assert.equal(audioFilenames.length, 111);
    assert.deepEqual(audioFilenames, expectedIds.map(id => `${id}.mp3`).sort());
    const { hasBundledAudio } = audioHarness().service;
    for (const id of expectedIds) {
      assert.equal(hasBundledAudio(id), true, id);
      assert.equal(hasBundledAudio(` ${id.toLowerCase()} `), true, id);
      assert.ok(fs.statSync(path.join(AUDIO_DIR, `${id}.mp3`)).size > 0, id);
    }
    for (const card of ipaDataset.filter(item => item.category === 'diacritic')) {
      assert.equal(hasBundledAudio(card.id), false, card.id);
    }
    for (const id of ['', 'C000', 'C084', 'V107', 'D167', '__proto__', '../C001']) {
      assert.equal(hasBundledAudio(id), false, id);
    }
  });

  test('every recording uses a Pages-safe ./audio/ URL and never overlaps the previous recording', async () => {
    const { service, instances } = audioHarness({ immediate: true });
    for (const filename of audioFilenames) {
      const id = filename.slice(0, -4);
      assert.equal(await service.playIPASound(id, id), true);
      assert.equal(instances.at(-1).src, `./audio/${filename}`);
      assert.equal(instances.at(-1).playCalls, 1);
      assert.equal(instances.filter(audio => !audio.paused).length, 1);
    }
    service.stopIPASound();
    assert.ok(instances.every(audio => audio.paused));
  });

  test('Sound-prompt eligible study cards include all 111 consonants/vowels and exclude diacritics', () => {
    const { hasBundledAudio } = audioHarness().service;
    const eligible = ipaDataset.filter(card => hasBundledAudio(card.id));
    assert.equal(eligible.length, 111);
    assert.equal(eligible.filter(card => card.category === 'consonant').length, 83);
    assert.equal(eligible.filter(card => card.category === 'vowel').length, 28);
    assert.ok(eligible.every(card => card.category !== 'diacritic'));
  });
});

describe('Audio cancellation and failed-play races', () => {
  test('a canceled pending play cannot resume after explicit stop', async () => {
    const { service, instances } = audioHarness();
    const pending = service.playIPASound('C001', 'p');
    const audio = instances[0];
    audio.currentTime = 1.25;
    service.stopIPASound();
    assert.equal(audio.currentTime, 0);
    assert.equal(audio.paused, true);
    audio.resolvePlay();
    assert.equal(await pending, false);
    assert.equal(audio.paused, true, 'Late play() completion must be paused again');
    assert.ok(audio.pauseCalls >= 2);
  });

  test('late completion of an older request cannot pause or replace the new sound', async () => {
    const { service, instances } = audioHarness();
    const first = service.playIPASound('C001', 'p');
    const second = service.playIPASound('C002', 'b');
    assert.equal(instances[0].paused, true);
    instances[1].resolvePlay();
    assert.equal(await second, true);
    instances[0].resolvePlay();
    assert.equal(await first, false);
    assert.equal(instances[0].paused, true);
    assert.equal(instances[1].paused, false);
    instances[0].onended();
    service.stopIPASound();
    assert.equal(instances[1].paused, true, 'An old ended event must not detach the newer active sound');
  });

  test('unknown/diacritic requests stop existing audio but create no Audio object', async () => {
    const { service, instances } = audioHarness({ immediate: true });
    assert.equal(await service.playIPASound('C001', 'p'), true);
    assert.equal(await service.playIPASound('D167', '˥'), false);
    assert.equal(instances.length, 1);
    assert.equal(instances[0].paused, true);
    assert.equal(await service.playIPASound('missing', '?'), false);
    service.stopIPASound();
    service.stopIPASound();
  });

  test('a rejected old play promise does not clear newer playback or report a spurious failure', async () => {
    const { service, instances, warnings } = audioHarness();
    const first = service.playIPASound('C001', 'p');
    const second = service.playIPASound('C002', 'b');
    instances[1].resolvePlay();
    assert.equal(await second, true);
    instances[0].rejectPlay();
    assert.equal(await first, false);
    assert.equal(warnings.length, 0);
    service.stopIPASound();
    assert.equal(instances[1].paused, true);
  });

  test('current playback rejection/constructor errors return false without unhandled rejections', async () => {
    const { service, instances, warnings } = audioHarness();
    const pending = service.playIPASound('C001', 'p');
    instances[0].rejectPlay();
    assert.equal(await pending, false);
    assert.equal(warnings.length, 1);
    service.stopIPASound();
    const unavailable = audioHarness({ throws: true });
    assert.equal(await unavailable.service.playIPASound('C001', 'p'), false);
    assert.equal(unavailable.warnings.length, 1);
  });
});

function assertUnavailableAudio(markup) {
  const audioButtons = buttons(markup).filter(button => /aria-label="Audio not currently available\."/.test(button.attributes));
  assert.equal(audioButtons.length, 1, 'Exactly one unavailable speaker control');
  assert.match(audioButtons[0].attributes, /\bdisabled(?:="")?(?:\s|$)/);
  assert.match(audioButtons[0].attributes, /\btext-slate-400\b/);
  assert.match(audioButtons[0].attributes, /\bcursor-not-allowed\b/);
  const describedBy = audioButtons[0].attributes.match(/aria-describedby="([^"]+)"/);
  assert.ok(describedBy, 'Unavailable control must be associated with its note');
  const paragraphs = [...markup.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)];
  const note = paragraphs.find(match => match[1].includes(`id="${describedBy[1]}"`));
  assert.ok(note, 'Accessible description points to the rendered small print');
  assert.equal(textContent(note[2]), 'Audio not currently available.');
  assert.match(note[1], /\btext-xs\b/);
}

const cardProps = {
  data: byId.get('D167'), promptFeature: IPAFeature.SOUND, maskedFeature: IPAFeature.LABEL,
  isFlipped: false, onFlip: noop, isQuiz: false, userInput: '', setUserInput: noop,
  feedback: 'none', onSubmit: noop, keyboardGroup: 'Diacritics', onKeyboardGroupChange: noop,
};

describe('Unavailable speaker controls (real React SSR)', () => {
  test('every diacritic has a disabled speaker and exact small print in both AudioButton variants', () => {
    for (const data of ipaDataset.filter(card => card.category === 'diacritic')) {
      for (const folded of [false, true]) assertUnavailableAudio(render(AudioButton, { data, folded }));
    }
  });

  test('actual Flashcard SOUND content uses the disabled diacritic speaker', () => {
    assertUnavailableAudio(render(Flashcard, cardProps));
  });

  test('actual FoldedCard SOUND surface uses the disabled diacritic speaker', () => {
    // Put SOUND first: useEffect does not run during SSR to change the surface.
    assertUnavailableAudio(render(FoldedCard, {
      ...cardProps, features: [IPAFeature.SOUND, IPAFeature.SYMBOL, IPAFeature.LABEL],
    }));
  });

  test('available consonants/vowels keep enabled speaker controls without the unavailable note', () => {
    for (const data of ipaDataset.filter(card => card.category !== 'diacritic')) {
      for (const folded of [false, true]) {
        const markup = render(AudioButton, { data, folded });
        const controls = buttons(markup);
        assert.equal(controls.length, 1, data.id);
        assert.doesNotMatch(controls[0].attributes, /\bdisabled(?:=|\s|$)/, data.id);
        assert.ok(controls[0].attributes.includes(`aria-label="Play audio for ${data.symbol}"`), data.id);
        assert.doesNotMatch(markup, /Audio not currently available\./, data.id);
      }
    }
  });
});

describe('IPA chart data and initial server render', () => {
  const sounds = new Map(ipaDataset.map(sound => [sound.id, sound]));
  const symbol = id => sounds.get(id)?.symbol;

  test('promoted chart sounds resolve to shared study records and existing audio', () => {
    const { hasBundledAudio } = audioHarness().service;
    for (const id of Object.keys(chartOnlySymbols)) {
      const sound = byId.get(id);
      assert.ok(sound.label && sound.pronunciationTip, sound.id);
      assert.equal(hasBundledAudio(sound.id), true);
      assert.equal(sounds.get(sound.id), sound);
    }
  });

  test('pulmonic places, manners and sound pairs keep their chart order', () => {
    assert.deepEqual(plain(chart.pulmonicPlaces), [
      'Bilabial', 'Labiodental', 'Dental', 'Alveolar', 'Postalveolar',
      'Retroflex', 'Palatal', 'Velar', 'Uvular', 'Pharyngeal', 'Glottal',
    ]);
    assert.deepEqual(plain(chart.pulmonicRows.map(row => row.manner)), [
      'Plosive', 'Nasal', 'Trill', 'Tap or flap', 'Fricative',
      'Lateral fricative', 'Approximant', 'Lateral approximant',
    ]);
    const pairs = chart.pulmonicRows.map(row => row.cells.map(cell =>
      `${cell.place}${cell.span ? `+${cell.span}` : ''}:${symbol(cell.voiceless) || '-'}/${symbol(cell.voiced) || '-'}`,
    ).join(' '));
    assert.deepEqual(plain(pairs), [
      '0:p/b 1:-/- 2+3:t/d 5:ʈ/ɖ 6:c/ɟ 7:k/ɡ 8:q/ɢ 9:-/- 10:ʔ/-',
      '0:-/m 1:-/ɱ 2+3:-/n 5:-/ɳ 6:-/ɲ 7:-/ŋ 8:-/ɴ 9:-/- 10:-/-',
      '0:-/ʙ 1:-/- 2+3:-/r 5:-/- 6:-/- 7:-/- 8:-/ʀ 9:-/- 10:-/-',
      '0:-/- 1:-/ⱱ 2+3:-/ɾ 5:-/ɽ 6:-/- 7:-/- 8:-/- 9:-/- 10:-/-',
      '0:ɸ/β 1:f/v 2:θ/ð 3:s/z 4:ʃ/ʒ 5:ʂ/ʐ 6:ç/ʝ 7:x/ɣ 8:χ/ʁ 9:ħ/ʕ 10:h/ɦ',
      '0:-/- 1:-/- 2+3:ɬ/ɮ 5:-/- 6:-/- 7:-/- 8:-/- 9:-/- 10:-/-',
      '0:-/- 1:-/ʋ 2+3:-/ɹ 5:-/ɻ 6:-/j 7:-/ɰ 8:-/- 9:-/- 10:-/-',
      '0:-/- 1:-/- 2+3:-/l 5:-/ɭ 6:-/ʎ 7:-/ʟ 8:-/- 9:-/- 10:-/-',
    ]);
  });

  test('merged cells cover all 11 places, and impossible slots never contain sounds', () => {
    const ids = [];
    for (const row of chart.pulmonicRows) {
      let nextPlace = 0;
      for (const cell of row.cells) {
        assert.equal(cell.place, nextPlace, row.manner);
        const span = cell.span || 1;
        assert.ok(Number.isInteger(span) && span >= 1);
        nextPlace += span;
        assert.ok([undefined, 'both', 'voiceless', 'voiced'].includes(cell.impossible));
        if (cell.impossible === 'both' || cell.impossible === 'voiceless') assert.equal(cell.voiceless, undefined);
        if (cell.impossible === 'both' || cell.impossible === 'voiced') assert.equal(cell.voiced, undefined);
        for (const id of [cell.voiceless, cell.voiced].filter(Boolean)) {
          assert.ok(sounds.has(id), id);
          ids.push(id);
        }
      }
      assert.equal(nextPlace, 11, row.manner);
    }
    assert.deepEqual(ids.sort(), sequence('C', 1, 59));
    assert.equal(chart.pulmonicRows[0].cells.find(cell => cell.place === 1).impossible, undefined, 'A blank possible cell must not become a shaded impossible cell');
    assert.equal(chart.pulmonicRows[0].cells.find(cell => cell.place === 10).impossible, 'voiced');
    assert.equal(chart.pulmonicRows[1].cells.find(cell => cell.place === 10).impossible, 'both');
  });

  test('non-pulmonic columns preserve clicks, implosives and ejectives', () => {
    assert.deepEqual(plain(chart.nonPulmonicColumns), ['Clicks', 'Voiced implosives', 'Ejectives']);
    assert.deepEqual(plain(chart.nonPulmonicRows.map(row => row.map(entry => entry.id))), [
      ['C060', 'C065', 'D138'], ['C061', 'C066', 'C080'], ['C062', 'C067', 'C081'],
      ['C063', 'C068', 'C082'], ['C064', 'C069', 'C083'],
    ]);
    for (const row of chart.nonPulmonicRows) {
      for (const entry of row) assert.ok(sounds.has(entry.id) && entry.description, entry.id);
    }
  });

  test('vowel quadrilateral includes all 28 vowels once, with unrounded/rounded ordering', () => {
    const ids = chart.vowelPositions.flatMap(position => [...position.ids]);
    assert.equal(new Set(ids).size, 28);
    assert.deepEqual(plain(ids.sort()), sequence('V', 79, 106));
    for (const position of chart.vowelPositions) {
      assert.ok(Number.isFinite(position.x) && position.x > 0 && position.x < 100);
      assert.ok(Number.isFinite(position.y) && position.y > 0 && position.y < 100);
      assert.ok(position.ids.length === 1 || position.ids.length === 2);
      if (position.ids.length === 2) {
        const [left, right] = position.ids.map(id => sounds.get(id));
        assert.match(left.label, /\bunrounded\b/, left.id);
        assert.match(right.label, /\brounded\b/, right.id);
        assert.equal(left.label.replace('unrounded', 'rounded'), right.label);
      }
    }
  });

  test('vowel height labels and diagonal/front–central–back relationships remain meaningful', () => {
    const point = id => chart.vowelPositions.find(position => position.ids.includes(id));
    assert.deepEqual(plain(chart.vowelHeightLabels.map(height => height.label)), ['Close', 'Close-mid', 'Open-mid', 'Open']);
    for (const [index, id] of ['V079', 'V083', 'V085', 'V088'].entries()) {
      assert.equal(point(id).y, chart.vowelHeightLabels[index].y);
    }
    const front = ['V079', 'V083', 'V085', 'V088'].map(point);
    for (let index = 1; index < front.length; index++) {
      assert.ok(front[index].x > front[index - 1].x, 'Front edge slopes towards the centre');
      assert.ok(front[index].y > front[index - 1].y);
    }
    assert.ok(point('V079').x < point('V090').x && point('V090').x < point('V098').x);
    assert.equal(point('V098').x, point('V105').x, 'Back edge is vertical');
    assert.ok(point('V081').y > point('V079').y && point('V081').y < point('V083').y);
  });

  test('other symbols and tie-bar annotations resolve without borrowing study IDs', () => {
    const ids = chart.otherSymbolRows.flatMap(row => [row.left, ...row.right]).filter(Boolean);
    assert.deepEqual([...ids].sort(), [...sequence('C', 70, 79), 'D147A', 'D147B'].sort());
    for (const row of chart.otherSymbolRows) {
      assert.ok(sounds.has(row.left) && row.description, row.left);
      for (const id of row.right.filter(Boolean)) assert.ok(sounds.has(id), id);
    }
    for (const id of ['D138', 'D147A', 'D147B']) assert.ok(chart.notationCues[id]);
    assert.match(chart.chartSource.url, /^https:\/\/www\.internationalphoneticassociation\.org\//);
    assert.equal(chart.chartSource.licenceUrl, 'https://creativecommons.org/licenses/by-sa/4.0/');
  });

  test('Chart SSR exposes four accessible section tabs, headers and real sound controls', () => {
    const { IPAChart } = load('components/IPAChart.tsx');
    const markup = render(IPAChart, {});
    const controls = buttons(markup);
    const tabs = controls.filter(button => /role="tab"/.test(button.attributes));
    assert.deepEqual(tabs.map(button => textContent(button.content)), ['Consonants', 'Vowels', 'Other symbols', 'Diacritics']);
    assert.equal(tabs.filter(button => /aria-selected="true"/.test(button.attributes)).length, 1);
    assert.match(markup, /role="tabpanel"/);
    for (const place of chart.pulmonicPlaces) assert.ok(textContent(markup).includes(place), place);
    for (const row of chart.pulmonicRows) assert.ok(textContent(markup).includes(row.manner), row.manner);
    const soundControls = controls.filter(button => /data-sound-id=/.test(button.attributes));
    assert.equal(soundControls.length, 74);
    for (const button of soundControls) {
      assert.match(button.attributes, /\bipa-font\b/);
      assert.match(button.attributes, /aria-label="[^"]+"/);
      assert.match(button.attributes, /aria-pressed="false"/);
    }
    const ejectiveMark = soundControls.find(button => /data-sound-id="D138"/.test(button.attributes));
    assert.match(ejectiveMark.attributes, /data-audio-available="false"/);
    assert.match(ejectiveMark.attributes, /Audio not currently available\./);
    assert.doesNotMatch(ejectiveMark.attributes, /\bdisabled(?:=|\s|$)/, 'Unavailable chart notation must remain selectable for its cue');
    assert.doesNotMatch(markup, /ipa-chart__detail/);
    assert.ok(soundControls.every(button => /aria-haspopup="dialog"/.test(button.attributes) && /aria-expanded="false"/.test(button.attributes)));
  });
});

describe('Shared pronunciation formatting and diacritic chart coverage', () => {
  const { pronunciationContent, splitAnnotatedText } = load('data/pronunciation.ts');
  const { lexicalExamples } = load('data/wordExamples.ts');
  const { PronunciationContent, WordExample } = load('components/PronunciationContent.tsx');

  test('ordinary slash prose stays prose while explicit IPA spans use Doulos', () => {
    const u = byId.get('V099');
    const content = pronunciationContent(u);
    assert.equal(content.tip.map(part => part.text).join(''), u.pronunciationTip);
    assert.deepEqual(plain(content.tip.filter(part => part.kind === 'ipa').map(part => part.text)), ['[w]', '/u/']);
    assert.ok(content.tip.some(part => part.kind === 'text' && part.text.includes('whistling/blowing')));
    const markup = render(PronunciationContent, { card: u });
    assert.ok(leafSpans(markup).filter(span => /ipa-font/.test(span.attributes)).every(span => !span.text.includes('blowing')));
    assert.equal(splitAnnotatedText('words/words and prose / more prose', []).length, 1);
  });

  test('all 172 cards have a shared tip without rewriting any source wording', () => {
    for (const card of ipaDataset) {
      const expected = card.pronunciationTip || chart.notationCues[card.id] || card.words.filter(word => typeof word === 'string').join(' ');
      assert.equal(pronunciationContent(card).tip.map(part => part.text).join(''), expected, card.id);
    }
  });

  test('structured lexical examples include italic spelling, broad IPA, a quoted meaning and variety', () => {
    for (const [id, example] of Object.entries(lexicalExamples)) {
      assert.ok(byId.has(id), id);
      for (const field of ['word', 'ipa', 'meaning', 'language', 'variety', 'source']) assert.ok(example[field], `${id}: ${field}`);
      assert.match(example.ipa, /^\/[^/\[\]]+\/$/, id);
      assert.match(example.source, /^https:\/\//, id);
      const markup = render(WordExample, { example });
      assert.match(markup, /<em>/);
      assert.ok(textContent(markup).includes(`'${example.meaning}'`), id);
      assert.ok(leafSpans(markup).some(span => /ipa-font/.test(span.attributes) && span.text === example.ipa));
    }
  });

  test('both card layouts render the same formatted example as the chart content', () => {
    const card = byId.get('V099');
    const common = textContent(render(PronunciationContent, { card }));
    const props = { ...cardProps, data: card, promptFeature: IPAFeature.EXAMPLES, maskedFeature: IPAFeature.LABEL };
    assert.ok(textContent(render(Flashcard, props)).includes(common));
    assert.ok(textContent(render(FoldedCard, { ...props, features: [IPAFeature.EXAMPLES, IPAFeature.SYMBOL, IPAFeature.LABEL] })).includes(common));
  });

  test('diacritic chart groups cover all 61 marks exactly once and none have audio', () => {
    const ids = [...chart.diacriticRows.flat().filter(Boolean), ...chart.additionalArticulationIds,
      ...chart.stressLengthIds, ...chart.toneRows.flat(), ...chart.intonationIds];
    assert.equal(ids.length, 61);
    assert.equal(new Set(ids).size, 61);
    assert.deepEqual([...ids].sort(), plain(ipaDataset.filter(card => card.category === 'diacritic').map(card => card.id).sort()));
    const { hasBundledAudio } = audioHarness().service;
    assert.ok(ids.every(id => !hasBundledAudio(id)));
  });

  test('keyboard buttons insert all five complete symbols at the selection, including ɧ', () => {
    let value;
    const keyboard = makeLoader({
      globals: { requestAnimationFrame: callback => callback() },
      externals: { react: { ...React, useRef: () => ({ current: null }) } },
    })('components/IPAKKeyboard.tsx').IPAKeyboard;
    const input = { selectionStart: 1, selectionEnd: 2, focus: noop, setSelectionRange: noop };
    const tree = keyboard({ value: 'abc', onChange: next => { value = next; }, inputRef: { current: input }, group: 'Consonants', onGroupChange: noop });
    const elements = [];
    const visit = node => {
      if (Array.isArray(node)) { node.forEach(visit); return; }
      if (!node || typeof node !== 'object') return;
      elements.push(node); visit(node.props?.children);
    };
    visit(tree);
    for (const symbol of Object.values(chartOnlySymbols)) {
      const button = elements.find(element => element.props?.['aria-label'] === `Insert ${symbol}`);
      assert.ok(button, symbol); button.props.onClick();
      assert.equal(value, `a${symbol}c`);
    }
  });

  test('the mixed IPA label and quiz symbol inputs select the IPA font', () => {
    const { PronunciationLabel } = load('components/PronunciationContent.tsx');
    const label = render(PronunciationLabel, { card: byId.get('C079') });
    assert.deepEqual(leafSpans(label).filter(span => /ipa-font/.test(span.attributes)).map(span => span.text), ['ʃ', 'x']);
    const props = { ...cardProps, data: byId.get('C079'), promptFeature: IPAFeature.LABEL, maskedFeature: IPAFeature.SYMBOL, isQuiz: true };
    // SSR starts on surface zero; use the symbol surface for the masked input.
    for (const markup of [render(Flashcard, props), render(FoldedCard, { ...props, features: [IPAFeature.SYMBOL, IPAFeature.LABEL, IPAFeature.SOUND] })]) {
      assert.match(markup, /<input[^>]+class="[^"]*\bipa-font\b/);
    }
  });
});

describe('Callout placement leaves the chart and navigation usable', () => {
  const { positionChartCallout } = load('services/chartCallout.ts');
  const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  test('fits phone/tablet/desktop viewports without covering the selected symbol or navigation', () => {
    for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1280, 900], [568, 320]]) {
      const navTop = height - 64;
      for (const x of [16, width / 2 - 22, width - 60]) {
        for (const y of [20, (navTop - 44) / 2, navTop - 60]) {
          const anchor = { left: x, right: x + 44, top: y, bottom: y + 44 };
          for (const naturalHeight of [130, 320, 650]) {
            const result = positionChartCallout(anchor, { left: 0, top: 0, width, height, bottomLimit: navTop }, naturalHeight);
            const rect = { left: result.left, right: result.left + result.width,
              top: result.top, bottom: result.top + Math.min(result.maxHeight, naturalHeight) };
            assert.ok(rect.left >= 12 && rect.right <= width - 12, JSON.stringify({ width, height, rect }));
            assert.ok(rect.top >= 12 && rect.bottom <= navTop - 12, JSON.stringify({ width, height, rect }));
            assert.equal(intersects(rect, anchor), false, JSON.stringify({ width, height, rect, anchor }));
            assert.ok(result.maxHeight > 0 && result.arrowOffset >= 20);
          }
        }
      }
    }
  });

  test('flips above a low symbol and keeps long mobile tips scrollable', () => {
    const result = positionChartCallout({ left: 250, right: 294, top: 420, bottom: 464 },
      { left: 0, top: 0, width: 320, height: 568, bottomLimit: 504 }, 800);
    assert.equal(result.placement, 'top');
    assert.ok(result.maxHeight < 800);
    assert.ok(result.left + result.width <= 308);
  });

  test('uses side space for a short landscape viewport', () => {
    const result = positionChartCallout({ left: 50, right: 94, top: 100, bottom: 144 },
      { left: 0, top: 0, width: 900, height: 320, bottomLimit: 256 }, 400);
    assert.equal(result.placement, 'right');
    assert.ok(result.left > 94);
  });

  test('accounts for an offset visual viewport when zoomed', () => {
    const result = positionChartCallout({ left: 150, right: 194, top: 200, bottom: 244 },
      { left: 100, top: 80, width: 320, height: 500, bottomLimit: 520 }, 250);
    assert.ok(result.left >= 112 && result.left + result.width <= 408);
    assert.ok(result.top >= 92 && result.top + Math.min(250, result.maxHeight) <= 508);
  });
});

describe('Hearts: local persistence and reliable synchronisation', () => {
  const { LikesClient, LIKES_STORAGE_KEY, normalizeLikesApiUrl } = makeLoader({ globals: { AbortController } })('services/likesService.ts');
  const id = '00000000-0000-4000-8000-000000000001';
  const otherId = '00000000-0000-4000-8000-000000000002';
  const reply = (total, mine) => ({ ok: true, headers: { get: () => null }, json: async () => ({ total, mine }) });
  function memory() {
    const values = new Map([['learned_map', '{"C001":"yes"}']]);
    return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  }
  function client(t, options = {}) {
    const storage = options.storage ?? memory();
    const instance = new LikesClient({ storage, idFactory: () => id, ...options });
    t.after(() => instance.stop());
    return { instance, storage };
  }
  const tap = (instance, times) => Promise.all(Array.from({ length: times }, () => instance.addHeart()));

  test('repeat taps persist across reloads without touching learning progress or inventing a shared total', async t => {
    const { instance, storage } = client(t);
    await tap(instance, 80);
    assert.equal(instance.getSnapshot().mine, 80);
    assert.equal(instance.getSnapshot().shared, null);
    assert.equal(instance.getSnapshot().status, 'local');
    assert.equal(storage.getItem('learned_map'), '{"C001":"yes"}');
    assert.equal(client(t, { storage }).instance.getSnapshot().mine, 80);
  });

  test('two tabs coordinate rapid clicks using the supplied browser lock', async t => {
    const storage = memory();
    let queue = Promise.resolve();
    let locks = 0;
    const withLock = task => { locks++; queue = queue.then(task); return queue; };
    const a = client(t, { storage, withLock }).instance;
    const b = client(t, { storage, withLock }).instance;
    const contributions = await Promise.all([tap(a, 50), tap(b, 50)]);
    a.reloadFromStorage(); b.reloadFromStorage();
    assert.equal(a.getSnapshot().mine, 100);
    assert.equal(b.getSnapshot().mine, 100);
    assert.equal(locks, 100);
    assert.deepEqual(contributions.flat().sort((x, y) => x - y), Array.from({ length: 100 }, (_, index) => index + 1));
  });

  test('a lost response leaves hearts queued and a retry sends the same cumulative count', async t => {
    let serverMine = 0;
    let loseResponse = true;
    const received = [];
    const fetcher = async (_url, options) => {
      const body = JSON.parse(options.body);
      received.push(body.count);
      serverMine = Math.max(serverMine, body.count);
      if (loseResponse) { loseResponse = false; throw new Error('Connection lost after save'); }
      return reply(10 + serverMine, serverMine);
    };
    const { instance, storage } = client(t, { apiUrl: 'https://hearts.example', fetcher });
    await tap(instance, 5);
    await instance.syncNow();
    assert.equal(instance.getSnapshot().pending, 5);
    assert.equal(instance.getSnapshot().status, 'offline');
    instance.stop();
    const reloaded = client(t, { storage, apiUrl: 'https://hearts.example', fetcher }).instance;
    await reloaded.syncNow();
    assert.deepEqual(received, [5, 5]);
    assert.equal(serverMine, 5);
    assert.equal(reloaded.getSnapshot().mine, 5);
    assert.equal(reloaded.getSnapshot().shared, 15);
    assert.equal(reloaded.getSnapshot().pending, 0);
  });

  test('large contributions are fully saved in bounded batches, not capped at 250', async t => {
    const received = [];
    const fetcher = async (_url, options) => {
      const count = JSON.parse(options.body).count;
      received.push(count);
      return reply(count + 7, count);
    };
    const { instance } = client(t, { apiUrl: 'https://hearts.example', fetcher });
    await tap(instance, 601);
    await instance.syncNow(); await instance.syncNow(); await instance.syncNow();
    assert.deepEqual(received, [250, 500, 601]);
    assert.equal(instance.getSnapshot().shared, 608);
    assert.equal(instance.getSnapshot().mine, 601);
    assert.equal(instance.getSnapshot().pending, 0);
  });

  test('an older read arriving after a save cannot lower either count or restore pending hearts', async t => {
    let finishRead;
    const fetcher = async (_url, options) => options.method === 'POST'
      ? reply(12, 2) : new Promise(resolve => { finishRead = resolve; });
    const { instance } = client(t, { apiUrl: 'https://hearts.example', fetcher });
    await tap(instance, 2);
    const reading = instance.refresh();
    await instance.syncNow();
    finishRead(reply(10, 0));
    await reading;
    assert.equal(instance.getSnapshot().shared, 12);
    assert.equal(instance.getSnapshot().mine, 2);
    assert.equal(instance.getSnapshot().pending, 0);
  });

  test('clearing site data during a save does not restore the old device identity or personal count', async t => {
    let finish;
    let sequence = 0;
    const { instance, storage } = client(t, {
      apiUrl: 'https://hearts.example', idFactory: () => sequence++ === 0 ? id : otherId,
      fetcher: async () => new Promise(resolve => { finish = resolve; }),
    });
    await tap(instance, 3);
    const saving = instance.syncNow();
    storage.values.delete(LIKES_STORAGE_KEY);
    instance.reloadFromStorage();
    finish(reply(3, 3)); await saving;
    assert.equal(instance.getSnapshot().mine, 0);
    assert.equal(JSON.parse(storage.getItem(LIKES_STORAGE_KEY)).id, otherId);
  });

  test('blocked storage and damaged JSON cannot break tapping', async t => {
    const blocked = client(t, { storage: { getItem: () => { throw new Error('Denied'); }, setItem: () => { throw new Error('Denied'); } } }).instance;
    await tap(blocked, 3);
    assert.equal(blocked.getSnapshot().mine, 3);
    assert.equal(blocked.getSnapshot().persistent, false);
    const storage = memory(); storage.setItem(LIKES_STORAGE_KEY, '{invalid');
    const repaired = client(t, { storage }).instance;
    await repaired.addHeart();
    assert.equal(repaired.getSnapshot().mine, 1);
    assert.equal(repaired.getSnapshot().persistent, true);
    assert.equal(JSON.parse(storage.getItem(LIKES_STORAGE_KEY)).mine, 1);
  });

  test('write-denied storage keeps subsequent hearts in memory instead of rereading stale values', async t => {
    const { instance } = client(t, { storage: { getItem: () => null, setItem: () => { throw new Error('Full'); } } });
    await tap(instance, 5);
    assert.equal(instance.getSnapshot().mine, 5);
    assert.equal(instance.getSnapshot().persistent, false);
  });

  test('invalid server replies do not acknowledge queued hearts', async t => {
    const { instance } = client(t, { apiUrl: 'https://hearts.example', fetcher: async () => reply(1, 20) });
    await tap(instance, 2); await instance.syncNow();
    assert.equal(instance.getSnapshot().pending, 2);
    assert.equal(instance.getSnapshot().shared, null);
    assert.equal(instance.getSnapshot().status, 'offline');
  });

  test('server retry delays replace an already queued burst timer', async t => {
    const timers = new Map();
    let sequence = 0;
    const { LikesClient: TimedClient } = makeLoader({ globals: {
      AbortController,
      setTimeout: (callback, delay) => { const handle = ++sequence; timers.set(handle, { callback, delay }); return handle; },
      clearTimeout: handle => timers.delete(handle),
    } })('services/likesService.ts');
    const instance = new TimedClient({
      apiUrl: 'https://hearts.example', storage: memory(), idFactory: () => id,
      fetcher: async () => ({ ok: false, headers: { get: () => '60' } }),
    });
    t.after(() => instance.stop());
    await instance.addHeart();
    assert.deepEqual([...timers.values()].map(timer => timer.delay), [750]);
    await instance.syncNow();
    assert.deepEqual([...timers.values()].map(timer => timer.delay), [60000]);
    assert.equal(instance.getSnapshot().pending, 1);
  });

  test('configuration accepts HTTPS and local development URLs without credentials or query strings', () => {
    assert.equal(normalizeLikesApiUrl('https://counter.example/'), 'https://counter.example');
    assert.equal(normalizeLikesApiUrl('http://127.0.0.1:8787'), 'http://127.0.0.1:8787');
    for (const value of ['', 'javascript:alert(1)', 'http://public.example', 'https://name:secret@example.com', 'https://example.com/?token=x', 'https://example.com/path']) {
      assert.equal(normalizeLikesApiUrl(value), '', value);
    }
  });

  test('widget SSR has an accessible repeatable heart button and an honest unknown community count', () => {
    const { LikesWidget } = load('components/LikesWidget.tsx');
    const html = render(LikesWidget, {});
    assert.match(html, /aria-label="Give IPA365 a heart"/);
    assert.match(html, /role="status"/);
    assert.doesNotMatch(html, /Tap as often|Saved here|shared counter not connected/i);
    assert.match(html, /data-heart-count="shared"[^>]*>—/);
    assert.match(html, /data-heart-count="mine">0/);
    assert.doesNotMatch(html, /role="dialog"/);
  });
});

describe('Heart reactions and surprise timing', () => {
  const { HeartReactionPicker, EMOJI_REACTIONS, HEART_SURPRISE_MS } = load('services/heartReactions.ts');

  test('62 unique emojis include all 40 additions and exhaust each shuffled bag without consecutive repeats', () => {
    const additions = '🐱 🐶 🐰 🐼 🦊 🐨 🐸 🐥 🐧 🦉 🐝 🐞 🐢 🐬 🐳 🦄 🐙 🦭 🦦 🦔 🌸 🌼 🌻 🌺 🌷 🍀 🌿 🍒 🍓 🍉 🚀 🪐 🌙 ☀️ 🌞 🌠 🫶 💝 🎈 🎊'.split(' ');
    assert.equal(EMOJI_REACTIONS.length, 62);
    assert.equal(new Set(EMOJI_REACTIONS).size, 62);
    for (const emoji of additions) assert.ok(EMOJI_REACTIONS.includes(emoji), emoji);
    for (const [caseIndex, random] of [() => 0, () => .999999, (() => {
      let seed = 42;
      return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
    })()].entries()) {
      const picker = new HeartReactionPicker(random);
      let previous;
      const batches = [];
      for (let batch = 0; batch < 10; batch++) {
        const emojis = Array.from({ length: 62 }, (_, index) => {
          const emoji = picker.next(batch * 62 + index + 1, 0).emoji;
          assert.notEqual(emoji, previous);
          previous = emoji;
          return emoji;
        });
        assert.deepEqual([...emojis].sort(), [...EMOJI_REACTIONS].sort());
        batches.push(emojis.join(' '));
      }
      if (caseIndex === 2) assert.ok(new Set(batches).size > 1);
    }
  });

  test('random surprise probability is one in twelve, with no chance draws during cooldown', () => {
    let draws = [];
    const picker = new HeartReactionPicker(() => draws.shift() ?? .5);
    assert.equal(picker.next(1, 0).surprise, undefined); // Prime the shuffled bag.
    draws = [1 / 12, 0];
    assert.equal(picker.next(2, 0).surprise, undefined); // Boundary is excluded.
    draws = [1 / 12 - .000001, 0];
    assert.equal(picker.next(3, 100).surprise.kind, 'constellation');
    draws = [0, .5];
    assert.equal(picker.next(4, 10_099).surprise, undefined);
    assert.equal(draws.length, 2);
    assert.equal(picker.next(5, 10_100).surprise.kind, 'butterfly');
    draws = [0, .999999];
    assert.equal(picker.next(6, 20_100).surprise.kind, 'golden');
  });

  test('future milestones override cooldown, while old or repeated counts never replay them', () => {
    const picker = new HeartReactionPicker(() => 0);
    assert.equal(picker.next(49, 0).surprise.kind, 'constellation');
    assert.deepEqual(plain(picker.next(50, 1).surprise), { kind: 'milestone', count: 50 });
    assert.equal(picker.next(50, 20_000).surprise, undefined);
    assert.equal(picker.next(49, 20_001).surprise, undefined);
    assert.equal(picker.next(51, 9999).surprise, undefined);
    assert.equal(picker.next(100, 10_000).surprise.kind, 'milestone');
    assert.equal(picker.next(101, 19_999).surprise, undefined);
    assert.equal(picker.next(200, 20_000).surprise.kind, 'milestone');
    const reopened = new HeartReactionPicker(() => .5);
    assert.equal(reopened.next(201, 0).surprise, undefined);
    assert.equal(HEART_SURPRISE_MS, 2000);
  });

  test('all four surprise scenes render as decorative content without controls or dialogs', () => {
    const { HeartSurprise } = load('components/HeartSurprise.tsx');
    for (const kind of ['constellation', 'butterfly', 'golden', 'milestone']) {
      const html = render(HeartSurprise, { surprise: { kind, count: 200 } });
      assert.match(html, new RegExp(`likes-widget__surprise--${kind}`));
      assert.match(html, /aria-hidden="true"/);
      assert.doesNotMatch(html, /<button|role="dialog"|<audio/);
      if (kind === 'milestone') assert.match(html, /200 hearts from you!/);
      if (kind === 'constellation') assert.match(html, /ipa-font/);
    }
  });

  test('rapid real taps keep exact counts, replace/expire surprises, and clear timers and listeners on unmount', async () => {
    const { LikesClient, LIKES_STORAGE_KEY } = makeLoader({ globals: { AbortController } })('services/likesService.ts');
    const values = new Map([[LIKES_STORAGE_KEY, JSON.stringify({ version: 1,
      id: '00000000-0000-4000-8000-000000000001', mine: 49, confirmed: 0, shared: null })]]);
    const client = new LikesClient({ storage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } });
    const scheduled = new Map();
    const listeners = new Set();
    let clock = 0, timerId = 0, cursor = 0, firstRender = true, tree;
    const slots = [], effects = [], cleanups = [];
    const events = { addEventListener: (_name, fn) => listeners.add(fn), removeEventListener: (_name, fn) => listeners.delete(fn) };
    const hooks = {
      ...React,
      useState(initial) {
        const slot = cursor++;
        if (firstRender) slots[slot] = typeof initial === 'function' ? initial() : initial;
        return [slots[slot], update => { slots[slot] = typeof update === 'function' ? update(slots[slot]) : update; rerender(); }];
      },
      useRef(initial) { const slot = cursor++; if (firstRender) slots[slot] = { current: initial }; return slots[slot]; },
      useEffect(effect) { cursor++; if (firstRender) effects.push(effect); },
    };
    const localLoad = makeLoader({ globals: { window: events, document: { ...events, visibilityState: 'visible' },
      performance: { now: () => clock },
      setTimeout: (callback, delay) => { const id = ++timerId; scheduled.set(id, { callback, at: clock + delay }); return id; },
      clearTimeout: id => scheduled.delete(id),
    }, externals: { react: hooks, '../services/likesService': { createBrowserLikesClient: () => client, LIKES_STORAGE_KEY } } });
    const { LikesWidget } = localLoad('components/LikesWidget.tsx');
    function rerender() { cursor = 0; tree = LikesWidget({}); firstRender = false; }
    function elements(value) {
      if (Array.isArray(value)) return value.flatMap(elements);
      return React.isValidElement(value) ? [value, ...elements(value.props.children)] : [];
    }
    function advance(milliseconds) {
      clock += milliseconds;
      for (const [id, task] of [...scheduled]) if (task.at <= clock) { scheduled.delete(id); task.callback(); }
    }
    async function taps(times) {
      const button = elements(tree).find(element => element.type === 'button');
      for (let index = 0; index < times; index++) button.props.onClick();
      for (let turn = 0; turn < 12; turn++) await Promise.resolve();
    }
    const scene = () => elements(tree).find(element => typeof element.type === 'function' && element.props.surprise)?.props.surprise;
    rerender();
    for (const effect of effects) cleanups.push(effect());
    assert.equal(scene(), undefined); // Stored hearts do not trigger a celebration.
    await taps(1);
    assert.equal(client.getSnapshot().mine, 50);
    assert.equal(scene().kind, 'milestone');
    advance(1999);
    assert.equal(scene().count, 50);
    await taps(50);
    assert.equal(client.getSnapshot().mine, 100);
    assert.equal(scene().count, 100); // New milestone replaces the old timer.
    advance(1);
    assert.equal(scene().count, 100);
    advance(1999);
    assert.equal(scene(), undefined);
    await taps(100);
    assert.equal(client.getSnapshot().mine, 200);
    assert.equal(scene().count, 200);
    const reactions = elements(tree).filter(element => element.props.className === 'likes-widget__reaction-count');
    assert.deepEqual(reactions.map(element => element.props.children.join('').replace(/\D/g, '')), Array.from({ length: 10 }, (_, index) => String(191 + index)));
    assert.ok(scheduled.size > 0);
    for (const cleanup of cleanups) cleanup();
    client.stop();
    assert.equal(scheduled.size, 0);
    assert.equal(listeners.size, 0);
    assert.equal(JSON.parse(values.get(LIKES_STORAGE_KEY)).mine, 200);
  });
});

describe('Read-only production configuration checks', () => {
  test('version and generated audio definitions agree with the production Vite configuration', () => {
    // Capture plugin options instead of starting Vite or importing its ESM plugins.
    const config = makeLoader({ externals: {
      vite: { defineConfig: value => value },
      '@vitejs/plugin-react': () => ({ name: 'test-react-plugin' }),
      'vite-plugin-pwa': { VitePWA: options => ({ name: 'test-pwa-plugin', options }) },
    } })('vite.config.ts').default;
    assert.equal(JSON.parse(readSource('package.json')).version, VERSION);
    assert.equal(JSON.parse(config.define.__APP_VERSION__), VERSION);
    assert.deepEqual(JSON.parse(config.define.__BUNDLED_AUDIO_FILES__), audioFilenames);
    assert.equal(config.base, './');
    assert.equal(config.build.outDir, 'dist');
    const { options } = config.plugins.find(plugin => plugin.name === 'test-pwa-plugin');
    assert.equal(options.registerType, 'autoUpdate');
    assert.equal(options.workbox.cleanupOutdatedCaches, true);
    for (const name of ['id', 'start_url', 'scope']) assert.equal(options.manifest[name], './');
    for (const icon of options.manifest.icons) {
      assert.ok(fs.existsSync(path.resolve(ROOT, 'public', icon.src)), icon.src);
    }
    const rule = options.workbox.runtimeCaching.find(item => item.urlPattern.test('/IPA_flashcard/audio/C083.mp3'));
    assert.ok(rule, 'New consonant names must match the audio cache rule');
    assert.equal(rule.handler, 'CacheFirst');
    assert.ok(rule.options.expiration.maxEntries >= audioFilenames.length);
    assert.ok(options.workbox.runtimeCaching.some(item => item.urlPattern.test('/IPA_flashcard/fonts/DoulosSIL-Regular.woff2')));
  });
});
