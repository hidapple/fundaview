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
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeBookmark(item))
      .filter((item): item is Bookmark => item !== null);
  } catch {
    return [];
  }
}

export function addBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  const normalizedGroup = normalizeGroupName(bookmark.group);
  if (!normalizedGroup) return;

  const normalized: Bookmark = {
    symbol: bookmark.symbol,
    name: bookmark.name,
    group: normalizedGroup,
  };

  if (bookmarks.some((b) => b.symbol === normalized.symbol && b.group === normalized.group)) return;
  bookmarks.push(normalized);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function removeBookmark(symbol: string, group: string): void {
  const normalizedGroup = normalizeGroupName(group);
  if (!normalizedGroup) return;
  const bookmarks = getBookmarks().filter((b) => !(b.symbol === symbol && b.group === normalizedGroup));
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function isBookmarked(symbol: string, group?: string): boolean {
  const bookmarks = getBookmarks();
  if (!group) return bookmarks.some((b) => b.symbol === symbol);

  const normalizedGroup = normalizeGroupName(group);
  if (!normalizedGroup) return false;
  return bookmarks.some((b) => b.symbol === symbol && b.group === normalizedGroup);
}

function normalizeGroupName(group: string | undefined): string {
  return typeof group === 'string' ? group.trim() : '';
}

function normalizeBookmark(value: unknown): Bookmark | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Partial<Bookmark>;
  if (typeof raw.symbol !== 'string' || typeof raw.name !== 'string') return null;
  const group = normalizeGroupName(raw.group);
  if (!group) return null;

  return {
    symbol: raw.symbol,
    name: raw.name,
    group,
  };
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
