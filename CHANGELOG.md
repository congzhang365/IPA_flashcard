# IPA365 Flashcards version history

Report the version number with every development handoff. Keep the package, lockfile and README version consistent. The app footer shows the author/copyright line without a preview-version label. Preview versions are not published releases; do not replace the existing GitHub v1.0.0 tag.

## 1.1.0-preview.4 — 31 October 2026

- Removed the visible chart-layout credit paragraph and preview-version footer line. The author/copyright footer remains; source and licence attribution are retained in the README and source metadata.
- Kept version tracking in the package, lockfile, README and development handoffs.
- Prepared this preview for publication on 4 November 2026. The existing stable v1.0.0 release tag is unchanged.

### Preview.4 publication checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.4-2026-11-04.zip`
- Files: **160**, verified byte-for-byte before preparing the push.
- Archive SHA-256: `D8283F39D0EA42BFE8F2AA72515A6456D2014D2BCB8AE97D3C1D8EB81E609EDA`
- Excludes dependencies, build output, Git internals, backups and the separate Lab/recording folders.

### Preview.3 checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.3-2026-10-31.zip`
- Files: **160**, verified byte-for-byte before editing.
- Archive SHA-256: `63666f5ab9b83eab2d7b0765f5d6a1dfec3573f459a8693ae933fc7c49c02c8c`
- Extract into an empty sibling folder to compare or restore; preserve later work and browser storage.

## 1.1.0-preview.3 — 31 October 2026

- Replaced the chart's bottom information panel with a callout beside the selected symbol. Hover/focus previews a tip; the first tap pins the callout and plays available audio, and a second tap closes it.
- Added Replay and × controls inside pinned callouts. Tapping another symbol switches directly. Escape, outside taps, chart scrolling and tab changes dismiss the callout without consuming navigation actions.
- Kept callouts non-modal, constrained above the bottom navigation, and able to scroll long tips internally. Keyboard-opened callouts focus their close control and return focus to the source on dismissal.
- Updated the tutorial and README to match. Deck contents, pronunciation wording, recording filenames and stored learning progress are unchanged; content corrections still await review.

### Preview.2 checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.2-2026-10-31.zip`
- Files: **159**, verified byte-for-byte before editing.
- Archive SHA-256: `f13d052c67627761f615244e87e70c2e53e354ea6815bed315b03229e303d7e6`
- Extract into an empty sibling folder to compare or restore; preserve later work and browser storage.

## 1.1.0-preview.2 — 30 October 2026

- Promoted ɧ, pʼ, tʼ, kʼ and sʼ to consonant study cards, preserving their existing IDs and MP3 filenames. The deck now has 172 cards: 83 consonants, 28 vowels and 61 diacritics. The ejective mark remains a diacritic and all five promoted sounds remain on the keyboard.
- Added the Diacritics chart section, with all 61 marks grouped into articulation, stress/length, and tones/intonation. Selection shows a carrier example and explanation without requesting audio. Narrow screens use two rows of chart tabs.
- Shared pronunciation presentation across cards, chart details and tooltips, with explicit IPA annotations. Fixed the whistling/blowing slash incorrectly changing prose to Doulos SIL.
- Added 46 structured lexical examples with italic spelling, broad IPA, a quoted meaning and a named variety. The other 65 sounds retain their original source candidates and show cues alone pending lexical review.
- Moved the approved Chart tutorial instructions immediately before Reset Progress; updated the README and attribution.
- Kept substantive cue corrections pending in PRONUNCIATION_REVIEW.md. Original tip strings remain unchanged.

### Preview.1 checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.1-2026-10-30.zip`
- Files: **153**, verified byte-for-byte before editing.
- Archive SHA-256: `e953e5290287c75d3c2de7bf2c5ad99a08f181e282d1638e2880094decce0ce8`
- Includes app source, configuration, documentation, scripts and public assets. Excludes dependencies, build output, Git internals, backups and the separate Lab/recording folders.
- Restore by extracting to an empty sibling folder for comparison, preserving later work and browser storage.

## 1.1.0-preview.1 — 30 October 2026

- Added a Chart bottom-navigation tab, with standard-layout consonant, vowel and other-symbol charts.
- Click or tap plays a recording and selects persistent pronunciation information; desktop hover and keyboard focus also show cues. Chart scrolling retains headers and standard symbol positions.
- Added 24 attributed Wikimedia recordings without changing the previous 87 files or filenames. The five extra sounds ɧ, pʼ, tʼ, kʼ, sʼ are chart/keyboard-only, not study cards.
- Added 12 tone-letter, contour and global-arrow study cards and keyboard keys. The study deck now has 167 cards; existing IDs and progress keys are preserved.
- Disabled diacritic speaker buttons in both card layouts, with “Audio not currently available.” underneath.
- Generate audio availability from actual bundled files and prevent overlapping playback.
- Preserve meaningful IPA modifiers in marking and distinguish different tone/modifier answers; consonant/vowel label-grading rules are unchanged.
- Corrected clearly mismatched production cues used by the chart, retained source attribution, and added the approved concise tutorial wording.
- The epiglottal recordings are source-labelled trills. Audio integrity checks do not substitute for an educator's phonetic listening review.

The intended stable release is **1.1.0**, after preview approval. Publishing a preview does not replace the existing GitHub v1.0.0 release tag.

## 1.0.0 pre-chart baseline — 30 October 2026

Exact local app snapshot before the chart, keyboard and audio changes. This is a local checkpoint, not a replacement for the older GitHub v1.0.0 release.

- Archive: `.backups/IPA365-v1.0.0-pre-chart-2026-10-30.zip`
- Files: **119**, verified byte-for-byte against the original files before editing.
- Archive SHA-256: `BA9748313F3712ABEFA824E949A9FD3D22E8874199DF6D8B738314E82968356C`
- The snapshot includes main-app source, configuration and public assets. It excludes Git internals, dependencies, build output and the separate Lab experiment/recording archive.

### Restoring the baseline

Stop the preview server and extract the archive into a **new, empty sibling folder** for comparison. Do not blindly overlay it on this version: files introduced by v1.1.0 would otherwise remain. Restore only the approved application files after preserving any later work. Keep the Lab experiment and recordings untouched, and do not clear browser storage; progress is stored there, not in the archive.

The development-preview origin on port 5174 is separate from the published app and any preview on port 5173; their browser progress is separate.
