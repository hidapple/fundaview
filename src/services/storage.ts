import type { Bookmark } from '../types';

const PREFIX = 'eps_';
const API_KEY_KEY = `${PREFIX}api_key`;
const BOOKMARKS_KEY = `${PREFIX}bookmarks`;
const CACHE_PREFIX = `${PREFIX}cache_`;

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_KEY);
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_KEY, key);
}

export function removeApiKey(): void {
  localStorage.removeItem(API_KEY_KEY);
}

export function getBookmarks(): Bookmark[] {
  const raw = localStorage.getItem(BOOKMARKS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Bookmark[];
}

export function addBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  if (bookmarks.some((b) => b.symbol === bookmark.symbol)) return;
  bookmarks.push(bookmark);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function removeBookmark(symbol: string): void {
  const bookmarks = getBookmarks().filter((b) => b.symbol !== symbol);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function isBookmarked(symbol: string): boolean {
  return getBookmarks().some((b) => b.symbol === symbol);
}

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export function getCached<T>(key: string): T | null {
  const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (!raw) return null;
  const entry = JSON.parse(raw) as CacheEntry<T>;
  if (Date.now() > entry.expiry) {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }
  return entry.data;
}

export function setCached<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  const entry: CacheEntry<T> = {
    data,
    expiry: Date.now() + ttlMs,
  };
  localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
}
