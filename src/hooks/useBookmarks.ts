import { useCallback, useMemo, useState } from 'react';
import type { Bookmark } from '../types';
import * as storage from '../services/storage';

export function useBookmarks(): {
  bookmarks: Bookmark[];
  groups: string[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (symbol: string, group: string) => void;
  isBookmarked: (symbol: string, group?: string) => boolean;
} {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => storage.getBookmarks());
  const groups = useMemo(
    () => Array.from(new Set(bookmarks.map((bookmark) => bookmark.group))),
    [bookmarks],
  );

  const addBookmark = useCallback((bookmark: Bookmark) => {
    storage.addBookmark(bookmark);
    setBookmarks(storage.getBookmarks());
  }, []);

  const removeBookmark = useCallback((symbol: string, group: string) => {
    storage.removeBookmark(symbol, group);
    setBookmarks(storage.getBookmarks());
  }, []);

  const isBookmarked = useCallback(
    (symbol: string, group?: string) =>
      group ? bookmarks.some((b) => b.symbol === symbol && b.group === group) : bookmarks.some((b) => b.symbol === symbol),
    [bookmarks],
  );

  return { bookmarks, groups, addBookmark, removeBookmark, isBookmarked };
}
