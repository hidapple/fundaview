import type { Bookmark } from '../types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
}

export function BookmarkList({ bookmarks, onSelect, onRemove }: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <p className="text-gray-400 text-xs">ブックマークがありません。銘柄を検索して追加してください。</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {bookmarks.map((bookmark) => (
        <span
          key={bookmark.symbol}
          className="inline-flex items-center bg-blue-50 text-blue-700 text-sm rounded-full px-3 py-1"
        >
          <button
            onClick={() => onSelect(bookmark.symbol)}
            className="hover:underline font-medium"
          >
            {bookmark.symbol}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(bookmark.symbol);
            }}
            className="ml-1.5 text-blue-400 hover:text-red-500 text-xs leading-none"
            aria-label={`Remove ${bookmark.symbol}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
