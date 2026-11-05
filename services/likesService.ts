/** Device-local hearts plus an optional, anonymous Cloudflare counter. */
export const LIKES_STORAGE_KEY = 'ipa365_hearts_v1';
export const LIKES_SYNC_CHUNK = 250;
const CLIENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isCount = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;

type LocalHearts = { version: 1; id: string; mine: number; confirmed: number; shared: number | null };
export type LikesSnapshot = {
  mine: number;
  shared: number | null;
  pending: number;
  connected: boolean;
  persistent: boolean;
  status: 'local' | 'loading' | 'ready' | 'saving' | 'offline';
};
type Options = {
  apiUrl?: string;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  fetcher?: typeof fetch;
  idFactory?: () => string;
  online?: () => boolean;
  withLock?: (task: () => void) => Promise<void>;
};

export function normalizeLikesApiUrl(value = ''): string {
  try {
    const url = new URL(value);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:'))
      || url.username || url.password || url.search || url.hash || url.pathname !== '/') return '';
    return url.origin;
  } catch { return ''; }
}

function newClientId() {
  // This is a random counter identifier, not an account or authentication token.
  return globalThis.crypto?.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
    const value = Math.floor(Math.random() * 16);
    return (character === 'x' ? value : (value & 3) | 8).toString(16);
  });
}

class RequestFailure extends Error {
  constructor(readonly retryAfter = 0) { super('Heart counter unavailable'); }
}

export class LikesClient {
  private readonly apiUrl: string;
  private readonly options: Options;
  private local: LocalHearts;
  private persistent: boolean;
  private status: LikesSnapshot['status'];
  private listeners = new Set<(snapshot: LikesSnapshot) => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private syncing: Promise<void> | undefined;
  private reading: Promise<void> | undefined;
  private active = true;
  private retryDelay = 5000;
  private lastRead = 0;

  constructor(options: Options = {}) {
    this.options = options;
    this.apiUrl = normalizeLikesApiUrl(options.apiUrl);
    this.persistent = Boolean(options.storage);
    this.local = this.read() ?? this.fresh();
    this.save();
    this.status = this.apiUrl ? 'loading' : 'local';
  }

  private fresh(): LocalHearts {
    return { version: 1, id: (this.options.idFactory ?? newClientId)(), mine: 0, confirmed: 0, shared: null };
  }

  private read(): LocalHearts | undefined {
    if (!this.persistent) return;
    let raw: string | null | undefined;
    try {
      raw = this.options.storage?.getItem(LIKES_STORAGE_KEY);
    } catch { this.persistent = false; return; }
    if (!raw) return;
    try {
      const value = JSON.parse(raw) as LocalHearts;
      if (value.version === 1 && typeof value.id === 'string' && CLIENT_ID.test(value.id)
        && isCount(value.mine) && isCount(value.confirmed) && value.confirmed <= value.mine
        && (value.shared === null || (isCount(value.shared) && value.shared >= value.confirmed))) return value;
    } catch { /* Replace a damaged record without touching study progress. */ }
  }

  private save() {
    if (!this.persistent) return;
    try { this.options.storage?.setItem(LIKES_STORAGE_KEY, JSON.stringify(this.local)); }
    catch { this.persistent = false; }
  }

  private pull() {
    if (!this.persistent) return;
    const current = this.read();
    if (current) this.local = current;
    else if (this.persistent) { this.local = this.fresh(); this.save(); }
  }

  getSnapshot(): LikesSnapshot {
    const pending = this.local.mine - this.local.confirmed;
    return {
      mine: this.local.mine,
      shared: this.local.shared === null ? null : this.local.shared + pending,
      pending, connected: Boolean(this.apiUrl), persistent: this.persistent, status: this.status,
    };
  }

  subscribe(listener: (snapshot: LikesSnapshot) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private publish() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(listener => listener(snapshot));
  }

  private exclusive(task: () => void) {
    return this.options.withLock ? this.options.withLock(task) : Promise.resolve().then(task);
  }

  async addHeart() {
    let contribution = this.local.mine;
    await this.exclusive(() => {
      this.pull();
      if (this.local.mine < Number.MAX_SAFE_INTEGER) this.local.mine += 1;
      this.save();
      contribution = this.local.mine;
      this.publish();
    });
    this.schedule();
    return contribution;
  }

  reloadFromStorage() {
    this.pull();
    this.publish();
    this.schedule();
  }

  start() { this.active = true; }
  stop() {
    this.active = false;
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  private schedule(delay = 750) {
    if (!this.active || !this.apiUrl || this.timer !== undefined) return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (this.getSnapshot().pending > 0) void this.syncNow();
      else if (this.status === 'offline') void this.refresh();
    }, delay);
  }

  private failed(error: unknown) {
    this.status = 'offline';
    this.publish();
    // A burst timer must not bypass a server's requested retry delay.
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    const delay = error instanceof RequestFailure ? Math.max(error.retryAfter, this.retryDelay) : this.retryDelay;
    this.schedule(delay);
    this.retryDelay = Math.min(this.retryDelay * 3, 300000);
  }

  private async request(path: string, init?: RequestInit): Promise<{ total: number; mine: number }> {
    if (this.options.online?.() === false) throw new RequestFailure();
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 10000);
    try {
      const response = await (this.options.fetcher ?? fetch)(`${this.apiUrl}${path}`, {
        ...init, credentials: 'omit', cache: 'no-store', signal: abort.signal,
      });
      if (!response.ok) {
        const seconds = Number(response.headers.get('Retry-After'));
        throw new RequestFailure(Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds * 1000, 86400000) : 0);
      }
      const result = await response.json() as { total: unknown; mine: unknown };
      if (!isCount(result.total) || !isCount(result.mine) || result.mine > result.total) throw new RequestFailure();
      return { total: result.total, mine: result.mine };
    } finally { clearTimeout(timeout); }
  }

  private async accept(id: string, result: { total: number; mine: number }) {
    await this.exclusive(() => {
      this.pull();
      if (this.local.id !== id) return; // Storage was cleared while a request was in flight.
      this.local.mine = Math.max(this.local.mine, result.mine);
      this.local.confirmed = Math.max(this.local.confirmed, result.mine);
      this.local.shared = Math.max(this.local.shared ?? 0, result.total);
      this.save();
      this.status = 'ready';
      this.retryDelay = 5000;
      this.publish();
    });
  }

  refresh(throttled = false): Promise<void> {
    if (!this.apiUrl || (throttled && Date.now() - this.lastRead < 30000)) return Promise.resolve();
    if (this.reading) return this.reading;
    this.pull();
    const id = this.local.id;
    this.reading = this.request(`/likes?clientId=${encodeURIComponent(id)}`)
      .then(result => this.accept(id, result))
      .then(() => { this.lastRead = Date.now(); this.schedule(); })
      .catch(error => this.failed(error))
      .finally(() => { this.reading = undefined; });
    return this.reading;
  }

  syncNow(): Promise<void> {
    if (!this.apiUrl) return Promise.resolve();
    if (this.syncing) return this.syncing;
    this.pull();
    if (this.local.mine === this.local.confirmed) return Promise.resolve();
    const id = this.local.id;
    const count = Math.min(this.local.mine, this.local.confirmed + LIKES_SYNC_CHUNK);
    this.status = 'saving';
    this.publish();
    this.syncing = this.request('/likes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: id, count }),
    }).then(result => this.accept(id, result))
      .catch(error => this.failed(error))
      .finally(() => {
        this.syncing = undefined;
        if (this.getSnapshot().pending > 0) this.schedule();
      });
    return this.syncing;
  }
}

export function createBrowserLikesClient() {
  let storage: Storage | undefined;
  if (typeof window !== 'undefined') {
    try { storage = window.localStorage; } catch { /* Private browsing can deny access. */ }
  }
  return new LikesClient({
    apiUrl: import.meta.env.VITE_LIKES_API_URL,
    storage,
    online: () => typeof navigator === 'undefined' || navigator.onLine,
    withLock: task => typeof navigator !== 'undefined' && navigator.locks
      ? navigator.locks.request('ipa365-hearts', task).catch(() => task()) : Promise.resolve().then(task),
  });
}
