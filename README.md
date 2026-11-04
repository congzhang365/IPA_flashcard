# IPA365 Flashcards

Current version: **v1.1.0-preview.4**. Planned stable release: **v1.1.0**. See [version history and rollback](CHANGELOG.md).

Master the International Phonetic Alphabet with this free, interactive flashcard tool. Practice consonants, vowels, and diacritics with an efficient study mode.

Access it here: https://congzhang365.github.io/IPA_flashcard/

Full tutorial: https://congzhang-linguist.github.io/resources/ipa365-tutorial/


---

## 🌟 Key Features

### 1. How a study session works
Choose the cards, prompt, answer, and study mode in **Study Setup** (the gear icon). The prompt provides the clue; the answer is the property you identify.
*   **Flash card mode**: With two features active, the app uses a classic flashcard view. Tap the card to flip between the prompt and answer.
*   **Tabbed card mode**: With three or more features enabled, each view appears in its own tab. Tap a tab or swipe left or right to browse.
*   **Quiz mode**: Type your answer, then submit it for automatic marking and earn stars.

### 2. Multi-Dimensional Customisation
Customise exactly how you are questioned (front side of a flash card or first clue for a folded card) and graded (backside of a flash card). Select from four key features:
*   **SYMBOL**: The raw phonetic symbol glyph (e.g., `[p]`, `[ð]`).
*   **LABEL**: Full linguistic phonetic classification descriptive label (e.g., *Voiced dental fricative*).
*   **SOUND**: Play available consonant and vowel recordings. Diacritic audio is not currently available. Its speaker button is disabled with the note “Audio not currently available.”
*   **EXAMPLES (E.g.)**: Illustrative word examples demonstrating the sound and/or pronunciation tips.

### 3. Quiz and review grading
Quiz Mode provides an IPA keyboard and automatically evaluates answers:
*   **Symbols:** An exact match earns one star; a different symbol with two labels matching the target earns half a star.
*   **Three-term labels:** Matching all labels earns one star; exactly one term different or missing earns half a star.
*   Correct cards leave the active deck. Incorrect cards reveal the current card's answer and return to the end of the deck.
*   Quiz points are collected in an animated star jar, with the three highest completed quiz scores retained.

In Flashcard mode, select a feedback level after revealing the answer:
*   **YES**: You remembered it; the card is archived from the active deck.
*   **MAYBE**: You are uncertain; the card stays in the deck.
*   **NO**: You need more practice; the card is shuffled back into the deck.

### 4. IPA Chart

Explore consonants, vowels, other symbols and diacritics in the **Chart** tab. Hover or focus for a tip. Tap a symbol to open its callout and play available audio; tap again to close. Use Replay to hear it again. Scrolling or switching tabs dismisses the callout. Diacritics show explanations only.

The callout stays beside its symbol and leaves the chart and bottom navigation usable. Tap another symbol to switch directly. The × button, Escape and tapping outside also close it. Long tips scroll inside the callout; this does not dismiss them. There is no separate information panel beneath the chart.

The chart preserves standard IPA positions and headers, including the consonant place/manner grid and vowel quadrilateral. All IPA uses bundled Doulos SIL. Bottom navigation is **Study · Chart · Tutorial · Lab**.

The study deck contains **172 cards: 83 consonants, 28 vowels and 61 diacritics/suprasegmentals**, including Chao tone letters, contours and global rise/fall arrows. **ɧ, pʼ, tʼ, kʼ, sʼ** appear in the study deck, chart and Consonants keyboard. The ejective mark **ʼ** remains in Diacritics as well.

There are **111 bundled recordings**, covering all current consonant/vowel study cards. Recordings can contain carrier vowels and repetitions. The epiglottal recordings are labelled as trills by their sources and need phonetic listening review; see [audio attribution and caveats](public/audio/ATTRIBUTION.md). Diacritics have no recordings; selecting them in the chart shows their explanation and illustrative placement.

Cards and chart tips use the same content renderer. Lexical examples use *spelling or transliteration* /broad IPA/, 'meaning' in a named language/variety. IPA uses local Doulos SIL; prose keeps the interface font. The preview has 46 formatted lexical examples. The remaining 65 sounds show their tip while their lexical examples await review; original candidates remain in the source. [Proposed pronunciation corrections and the complete pending-example list](PRONUNCIATION_REVIEW.md) require author approval before substantive changes are applied.

### Local development

```sh
npm install
npm run dev
npm test
npm run build
```

Audio availability is generated from the MP3s in `public/audio` when Vite starts or builds. Restart the dev server after adding recordings. Audio is cached for offline reuse after it has been played online; uncached recordings require a connection.

---

## 🏗️ TO DO

*   Complete phonetic listening review of the newly sourced consonant recordings
*   Add suitable audio examples for diacritics
*   Develop IPA Lab for customised synthesis

---

## Sources

IPA recordings were downloaded from the [Interactive IPA Chart](https://www.ipachart.com/), which credits recordings from Peter Isotalo, User:Denelson83, the UCLA Phonetics Lab Archive, User:Halibutt, User:Pmx, and User:Octane. The chart states that the clips are available under free and/or copyleft licences; see the linked [Wikimedia Commons phonetics collection](https://commons.wikimedia.org/wiki/Category:General_phonetics) for individual licensing details. 

The 24 recordings added in v1.1.0-preview.1 are from Wikimedia Commons. Individual authors, licences, original files, MP3 transcodes and review notes are recorded in [ATTRIBUTION.md](public/audio/ATTRIBUTION.md) and [sources.json](public/audio/sources.json). Existing filenames and the 87 earlier recordings are unchanged.

Interactive chart layout adapted from the [International Phonetic Association's IPA chart](https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_E/IPA_charts_E.html), © International Phonetic Association, under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Adaptations include colours, Doulos SIL typography and interactive controls. This attribution concerns the chart layout, not the separately licensed audio or source implementation.

Some pronunciation tips are adapted from [Newcastle University's IPA Online](https://teaching.ncl.ac.uk/ipa/) resources, developed by Ghada Khattab and Gerry Docherty, and used under a CC BY-NC licence.

Corrected and additional production cues are supplied by IPA365; the original attribution is retained for adapted material.

The preview.2 formatting migration preserves existing source-tip wording. The [content review](PRONUNCIATION_REVIEW.md) records proposed phonetic corrections and language-specific references. Structured lexical examples in `data/wordExamples.ts` include their dictionary reference and variety; IPA365 supplies the concise glosses and broad transcriptions. The shared formatter uses explicit IPA annotations rather than interpreting every slash as phonetic notation.

## 🤝 Citation
```
@software{Zhang_2026_IPA-Flashcard,
  author = {{Cong Zhang}},
  year = {2026},
  title = {IPA365 Flashcards},
  url = {https://congzhang365.github.io/IPA_flashcard/},
  version = {1.1.0-preview.4}
  ```
