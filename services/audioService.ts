/** Bundled IPA recordings; sources and licences are in public/audio/ATTRIBUTION.md. */
const LOCAL_AUDIO_BASE_URL = `${import.meta.env.BASE_URL}audio/`;
const audioFiles = new Map(__BUNDLED_AUDIO_FILES__.map(filename => [
  filename.slice(0, -4).toUpperCase(), filename,
]));
let activeAudio: HTMLAudioElement | null = null;
let playbackRequest = 0;

export const hasBundledAudio = (id: string): boolean => audioFiles.has(id.trim().toUpperCase());

export const stopIPASound = (): void => {
  playbackRequest++;
  if (!activeAudio) return;
  activeAudio.pause();
  try { activeAudio.currentTime = 0; } catch { /* Audio may not have loaded. */ }
  activeAudio = null;
};

/** A new selection cancels the previous recording, including a pending play(). */
export const playIPASound = async (id: string, symbol: string): Promise<boolean> => {
  stopIPASound();
  const filename = audioFiles.get(id.trim().toUpperCase());
  if (!filename) return false;
  const request = playbackRequest;
  try {
    const audio = new Audio(`${LOCAL_AUDIO_BASE_URL}${encodeURIComponent(filename)}`);
    activeAudio = audio;
    audio.onended = () => { if (activeAudio === audio) activeAudio = null; };
    await audio.play();
    if (request !== playbackRequest) { audio.pause(); return false; }
    return true;
  } catch (error) {
    if (request === playbackRequest) {
      activeAudio = null;
      console.warn(`Audio playback failed for ${symbol} (${id}).`, error);
    }
    return false;
  }
};

export const playSynthesizedWord = (ipaString: string) => {
  console.log('Synthesized word playback requested for:', ipaString);
  // This is a placeholder for future word-synthesis development.
};
