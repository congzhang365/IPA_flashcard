/** Decoration only: this picker never reads or writes heart/progress storage. */
export const IPA_REACTIONS = ['ə', 'ʃ', 'ɡ', 'æ', 'ɲ', 'i', 'ʒ', 'ɬ', 'u', 'ʘ', 'ɹ', 'y'];
export const EMOJI_REACTIONS = [
  '❤️', '✨', '🥰', '😍', '😊', '🤩', '🥳', '😄', '😎', '🙌', '👏',
  '💖', '💕', '💗', '💛', '💚', '💙', '💜', '🌈', '🌟', '🎉', '🦋',
  '🐱', '🐶', '🐰', '🐼', '🦊', '🐨', '🐸', '🐥', '🐧', '🦉',
  '🐝', '🐞', '🐢', '🐬', '🐳', '🦄', '🐙', '🦭', '🦦', '🦔',
  '🌸', '🌼', '🌻', '🌺', '🌷', '🍀', '🌿', '🍒', '🍓', '🍉',
  '🚀', '🪐', '🌙', '☀️', '🌞', '🌠', '🫶', '💝', '🎈', '🎊',
];
export const HEART_SURPRISE_MS = 2000;
const RANDOM_COOLDOWN_MS = 10_000;
const RANDOM_SURPRISES = ['constellation', 'butterfly', 'golden'] as const;
export type HeartSurpriseKind = typeof RANDOM_SURPRISES[number] | 'milestone';
export type HeartSurprise = { kind: HeartSurpriseKind; count: number };

export class HeartReactionPicker {
  private bag: string[] = [];
  private lastEmoji = '';
  private lastSurpriseAt = -Infinity;
  private highestCount = 0;

  constructor(private readonly random = Math.random) {}

  private nextEmoji() {
    if (this.bag.length === 0) {
      this.bag = [...EMOJI_REACTIONS];
      for (let index = this.bag.length - 1; index > 0; index--) {
        const other = Math.floor(this.random() * (index + 1));
        [this.bag[index], this.bag[other]] = [this.bag[other], this.bag[index]];
      }
      if (this.bag[0] === this.lastEmoji) {
        [this.bag[0], this.bag[1]] = [this.bag[1], this.bag[0]];
      }
    }
    this.lastEmoji = this.bag.shift()!;
    return this.lastEmoji;
  }

  /** Call only after an actual tap commits; refreshes and syncs do not call this. */
  next(count: number, now = performance.now()) {
    const emoji = this.nextEmoji();
    const newCount = count > this.highestCount;
    this.highestCount = Math.max(this.highestCount, count);
    let surprise: HeartSurprise | undefined;
    if (newCount && (count === 50 || (count >= 100 && count % 100 === 0))) {
      surprise = { kind: 'milestone', count };
    } else if (newCount && now - this.lastSurpriseAt >= RANDOM_COOLDOWN_MS && this.random() < 1 / 12) {
      surprise = { kind: RANDOM_SURPRISES[Math.floor(this.random() * RANDOM_SURPRISES.length)], count };
    }
    if (surprise) this.lastSurpriseAt = now;
    return { emoji, surprise };
  }
}
