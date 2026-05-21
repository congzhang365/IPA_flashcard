
/**
 * AUDIO SOURCE INSTRUCTIONS:
 * 1. Download IPA sounds from your preferred sources:
 *    - https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_TI/IPA_charts_TI.html#eng
 *    - https://www.ipachart.com/
 * 2. Host them in a directory (e.g., /public/audio/) or use a CDN.
 * 3. File naming convention: [symbol]_[version].mp3 (e.g., p_0.mp3, p_1.mp3).
 * 4. Update the AUDIO_BASE_URL and VERSION_COUNT_MAP below.
 */

// Placeholder URL. Replace with your hosted folder URL or relative path like '/audio/'
const FALLBACK_AUDIO_BASE_URL = 'https://www.ipachart.com/s/'; 

// If you have multiple versions for specific symbols, define the count here.
const VERSION_COUNT_MAP: Record<string, number> = {
  // 'p': 2, // Example: symbol 'p' has 2 versions
};

/**
 * Checks if a local file exists using a quick HEAD request.
 */
const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Plays the IPA sound for a card.
 * It dynamically searches for user-recorded audio files in this order:
 *   1. /public/audio/[ID].mp3       (e.g., C001.mp3 - highly recommended, case-insensitive, OS-friendly)
 *   2. /public/audio/[symbol].mp3   (e.g., p.mp3)
 * If neither is found locally, it falls back to the high-quality ipachart.com online sound database!
 */
export const playIPASound = async (id: string, symbol: string) => {
  const cleanId = id.trim();
  const lowerId = cleanId.toLowerCase();
  const encodedSymbol = encodeURIComponent(symbol);
  
  // Potential local paths to check
  const localIdPath = `./audio/${cleanId}.mp3`;
  const localLowerIdPath = `./audio/${lowerId}.mp3`;
  const localSymbolPath = `./audio/${encodedSymbol}.mp3`;
  
  let finalAudioUrl = '';

  // 1. Check capitalized ID (e.g., C001.mp3)
  if (await checkFileExists(localIdPath)) {
    finalAudioUrl = localIdPath;
    console.log(`🔊 Playing custom audio for ${symbol} using card ID: ${localIdPath}`);
  }
  // 2. Check lowercase ID (e.g., c001.mp3)
  else if (await checkFileExists(localLowerIdPath)) {
    finalAudioUrl = localLowerIdPath;
    console.log(`🔊 Playing custom audio for ${symbol} using lowercase card ID: ${localLowerIdPath}`);
  }
  // 3. Check IPA symbol (e.g., p.mp3)
  else if (await checkFileExists(localSymbolPath)) {
    finalAudioUrl = localSymbolPath;
    console.log(`🔊 Playing custom audio using symbol name: ${localSymbolPath}`);
  }
  // 4. Default to standard chart CDN fallback
  else {
    const versions = VERSION_COUNT_MAP[symbol] || 1;
    const versionIndex = Math.floor(Math.random() * versions);
    let fileName = encodedSymbol;
    if (versions > 1) {
      fileName += `_${versionIndex}`;
    }
    finalAudioUrl = `${FALLBACK_AUDIO_BASE_URL}${fileName}.mp3`;
    console.log(`🌐 Playing fallback sound for ${symbol} from CDN: ${finalAudioUrl}`);
  }

  const audio = new Audio(finalAudioUrl);
  audio.play().catch(err => {
    console.warn(`Audio playback failed for ${symbol} using URL: ${finalAudioUrl}`, err);
  });
};

export const playSynthesizedWord = (ipaString: string) => {
  console.log("Synthesized word playback requested for:", ipaString);
  // This is a placeholder for future word-synthesis development.
};
