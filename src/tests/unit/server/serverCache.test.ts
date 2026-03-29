/**
 * ServerCache — In-memory TTL cache tests.
 *
 * Covers:
 *  - set/get basic operations
 *  - TTL expiry
 *  - del removes a single key
 *  - invalidatePrefix removes matching keys
 *  - clear empties entire cache
 *  - Max entries eviction (LRU-like)
 *  - stats() returns correct size
 *  - Typed get<T>
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to replicate the ServerCache class for testing since
// the server module uses Deno imports. This tests the algorithm.

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

class ServerCache {
  private store = new Map<string, CacheEntry>();
  private maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  set<T>(key: string, value: T, ttlSeconds = 60): void {
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  del(key: string): void { this.store.delete(key); }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear(): void { this.store.clear(); }

  stats() { return { size: this.store.size, maxEntries: this.maxEntries }; }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ServerCache', () => {
  let cache: ServerCache;

  beforeEach(() => {
    cache = new ServerCache(5); // Low max for testing eviction
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('set and get a value', () => {
    cache.set('key1', { name: 'Amman' });
    expect(cache.get<{ name: string }>('key1')).toEqual({ name: 'Amman' });
  });

  it('returns null for missing keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('expires entries after TTL', () => {
    cache.set('temp', 'hello', 5); // 5 seconds
    expect(cache.get('temp')).toBe('hello');

    vi.advanceTimersByTime(6_000); // 6 seconds later
    expect(cache.get('temp')).toBeNull();
  });

  it('del removes a single key', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.del('a');

    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBe(2);
  });

  it('invalidatePrefix removes all matching keys', () => {
    cache.set('search:amman:irbid', [1]);
    cache.set('search:amman:zarqa', [2]);
    cache.set('profile:u1', { name: 'A' });

    cache.invalidatePrefix('search:');

    expect(cache.get('search:amman:irbid')).toBeNull();
    expect(cache.get('search:amman:zarqa')).toBeNull();
    expect(cache.get('profile:u1')).toEqual({ name: 'A' });
  });

  it('clear empties the entire cache', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();

    expect(cache.stats().size).toBe(0);
  });

  it('evicts oldest entry when at max capacity', () => {
    // Max is 5
    cache.set('k1', 1, 300);
    cache.set('k2', 2, 300);
    cache.set('k3', 3, 300);
    cache.set('k4', 4, 300);
    cache.set('k5', 5, 300);

    expect(cache.stats().size).toBe(5);

    // Adding 6th should evict k1 (oldest)
    cache.set('k6', 6, 300);
    expect(cache.stats().size).toBe(5);
    expect(cache.get('k1')).toBeNull(); // evicted
    expect(cache.get('k6')).toBe(6);     // newest
  });

  it('stats returns correct size', () => {
    expect(cache.stats()).toEqual({ size: 0, maxEntries: 5 });
    cache.set('x', 'y');
    expect(cache.stats().size).toBe(1);
  });

  it('typed get returns correct type', () => {
    cache.set('trip', { id: 't1', from: 'Amman', seats: 3 });
    const trip = cache.get<{ id: string; from: string; seats: number }>('trip');
    expect(trip?.id).toBe('t1');
    expect(trip?.seats).toBe(3);
  });
});
