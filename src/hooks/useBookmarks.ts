import { useCallback, useState } from 'react';
import type { Bookmark } from '../types';
import * as storage from '../services/storage';

export function useBookmarks(): {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (symbol: string) => void;
  isBookmarked: (symbol: string) => boolean;
} {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => storage.getBookmarks());

  const addBookmark = useCallback((bookmark: Bookmark) => {
    storage.addBookmark(bookmark);
    setBookmarks(storage.getBookmarks());
  }, []);

  const removeBookmark = useCallback((symbol: string) => {
    storage.removeBookmark(symbol);
    setBookmarks(storage.getBookmarks());
  }, []);

  const isBookmarked = useCallback(
    (symbol: string) => bookmarks.some((b) => b.symbol === symbol),
    [bookmarks],
  );

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
