# IPA365 Flashcards version history

Report the version number with every development handoff. Keep the package, lockfile and README version consistent. The app footer shows the author/copyright line without a preview-version label. Preview versions are not published releases; do not replace the existing GitHub v1.0.0 tag.

## 1.1.0-preview.10 — 5 November 2026

- Added one `heart_click` event per heart tap to the existing Google Analytics stream, enabling country/city reporting without sending Cloudflare browser IDs or personal heart totals.
- Keep reporting out of development and other hosts. Missing or blocked Analytics does not affect the shared counter or reactions; syncing/retries/reloads do not emit heart events.
- Added instructions for a saved IPA365 hearts by location exploration. Cloudflare data and existing Google tag settings are unchanged.
- Published the event tracking to GitHub Pages on 5 November 2026. All 78 automated tests and the production build pass; the destination measurement ID matches the IPA Flashcard property's active web stream.

### Published preview.9 checkpoint

- Exact Git archive: `.backups/IPA365-v1.1.0-preview.9-published-2026-11-05.zip`
- Published commit: `77968f98aeb5a176dd09b793ed18c39e6a7e8b0a`
- Archive SHA-256: `9AD7CC7B9D8CC1EC9A6E9BF185CA7E728C6E85906BDBBB38D3F3F146B63698FD`

## 1.1.0-preview.9 — 5 November 2026

- Expanded heart reactions to 62 emojis, using shuffled batches with no immediate repeats.
- Added occasional IPA constellations, butterflies with heart trails and golden-heart sparkles. Random surprises have a 1-in-12 chance after a 10-second cooldown; personal milestones at 50 and each 100 take priority.
- Keep one surprise visible for about two seconds, with silent static equivalents for reduced-motion preferences. Effects stay around the heart without changing layout or intercepting navigation.
- Preserved personal counts and Cloudflare synchronization: every tap still contributes one heart. Reloading and syncing do not trigger surprises.
- Updated the concise tutorial instructions and documentation. Published this preview to GitHub Pages on 5 November 2026, including the shared hearts connection and the changes from previews .5–.8. The stable v1.0.0 release tag and verified preview.8 checkpoint are retained.
- Validation: 75 automated tests and the production build pass. Browser checks covered 320/390/768/1280px layouts, all surprise scenes, navigation, automatic expiry, actual reduced-motion styles and two keyboard taps saved to the shared counter.

### Preview.9 publication checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.9-pre-publish-2026-11-05.zip`
- Files: **172**, verified byte-for-byte before the publication notes were updated; local configuration, QA files, dependencies, experiments and recordings are excluded.
- Archive SHA-256: `f67d452adc6873121f80b22e9e7bfe17b6490bc5441a66db3c78d5a2bb53e7b4`

## 1.1.0-preview.8 — 5 November 2026

- Removed the heart widget's box and permanent symbol/count badge. Centred the heart and Like IPA365? together, keeping the 44px touch target.
- Kept the animated IPA/running-count effect and added 20 more emoji reactions, for 22 emoji choices in total.
- Removed the visible Total hearts label. The footer keeps only its tiny heart and total at the existing size; screen-reader labels remain available.
- Connected the local preview to the deployed Cloudflare Worker and D1 counter. Saved the public API URL as the repository's Actions variable for future builds. Verified that 172 pending hearts synced and two live taps increased the saved shared total to 174. The frontend changes are still unpublished.

### Preview.8 connection checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.8-2026-11-05.zip`
- Files: **170**, verified byte-for-byte before updating the connection documentation; local environment and account configuration files are excluded.
- Archive SHA-256: `68cbcdd5e14d722f6f7da6d768a0a7d65061435c92c6fb0fbfb9f4e66e108ef4`

### Preview.7 checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.7-2026-11-05.zip`
- Files: **170**, verified byte-for-byte before editing.
- Archive SHA-256: `82D32725212339814D4F9442D373290715A19A27934B9DE4929C37DFA7195C89`

## 1.1.0-preview.7 — 5 November 2026

- Removed the repeated-tapping instruction and visible connection messages from the heart widget.
- Moved the community total into small text below the copyright footer. Personal hearts appear as an IPA symbol/count pair beside the button, and each floating reaction includes its own updated running count.
- Return each committed tap's count from the existing storage lock so rapidly added hearts receive the correct individual animation numbers. Updated the existing concurrency regression check to verify these returned counts.

### Preview.6 checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.6-2026-11-05.zip`
- Files: **170**, verified byte-for-byte before editing.
- Archive SHA-256: `6C15C5B997F945EEE484520ADC1EDE3343388230906D562B90CD8956D52C7D14`

## 1.1.0-preview.6 — 5 November 2026

- Reduced the heart widget to a compact white row with the cards' light slate border and typography. Kept a 44px touch target, smaller IPA reactions, and clearly labelled Total/You counts.
- Removed the large peach panel, extra caption and divider. Connection messages use one small line; the normal connected thank-you message stays available to screen readers without taking layout space.
- Heart storage and syncing behaviour are unchanged.

### Preview.5 checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.5-2026-11-05.zip`
- Files: **170**, verified byte-for-byte before the layout changes.
- Archive SHA-256: `D57E1D6E2B774C69E387EB1141E4FEFA5B05D42F5AA7A4044E1A60CEAE6D0D53`

## 1.1.0-preview.5 — 5 November 2026

- Added an inline heart widget above the copyright footer, with unlimited repeat taps, small IPA reactions, a shared total and a device-local contribution count. Respects reduced-motion preferences and supports keyboard activation.
- Save hearts locally before syncing; batch rapid taps and use cumulative per-browser counts so retries and stale requests do not count hearts twice. Pending hearts survive reloads, and tabs share browser storage and a Web Lock where available.
- Added a standalone Cloudflare Worker and D1 schema in `backend/likes`, with validated requests, atomic counter updates and explicit allowed website origins. The app and all source code remain on GitHub/GitHub Pages.
- Added account/setup instructions, a public API URL build variable, and frontend/API/SQLite regression checks. The shared counter requires the owner's free Cloudflare account and is not yet connected or deployed.
- Study content, grading, audio filenames and saved learning progress are unchanged.

### Published preview.4 checkpoint

- Archive: `.backups/IPA365-v1.1.0-preview.4-published-2026-11-05.zip`
- Exact Git archive of published commit `08289f871dcecadd29cd64a78b6913eb52691dd2` before this change.
- Archive SHA-256: `8DFA5E8D7D43C138B0D3FD4DF9A3C88587203A0BB77ABA4CA729F219BD4F94CF`

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
