/**
 * Bundled recordings are from the public IPA chart at https://www.ipachart.com/.
 * They are stored in /public/audio/ using the card ID as the filename (for
 * example, C001.mp3 for [p]), which keeps Unicode IPA symbols out of the lookup.
 */

// Vite supplies './' for the GitHub Pages deployment, so audio also works
// when the app is hosted under /IPA_flashcard/ rather than at the domain root.
const LOCAL_AUDIO_BASE_URL = `${import.meta.env.BASE_URL}audio/`;

/** True when a bundled recording currently exists for this card. */
export const hasBundledAudio = (id: string): boolean => {
  const match = id.trim().toUpperCase().match(/^([CV])(\d+)$/);
  if (!match) return false;
  const number = Number(match[2]);
  return match[1] === 'C' ? number >= 1 && number <= 59 : number >= 79 && number <= 106;
};

const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/** Plays the bundled IPA recording for a card. */
export const playIPASound = async (id: string, symbol: string) => {
  const cleanId = id.trim();
  const lowerId = cleanId.toLowerCase();
  const encodedSymbol = encodeURIComponent(symbol);
  const candidates = [
    `${LOCAL_AUDIO_BASE_URL}${cleanId}.mp3`,
    `${LOCAL_AUDIO_BASE_URL}${lowerId}.mp3`,
    `${LOCAL_AUDIO_BASE_URL}${encodedSymbol}.mp3`,
  ];

  for (const url of candidates) {
    if (!(await checkFileExists(url))) continue;

    const audio = new Audio(url);
    try {
      await audio.play();
      console.log(`🔊 Playing IPA sound for ${symbol}: ${url}`);
      return;
    } catch (error) {
      console.warn(`Audio playback failed for ${symbol} using ${url}`, error);
    }
  }

  console.warn(`No bundled IPA recording found for ${symbol} (${id}).`);
};

export const playSynthesizedWord = (ipaString: string) => {
  console.log('Synthesized word playback requested for:', ipaString);
  // This is a placeholder for future word-synthesis development.
};
