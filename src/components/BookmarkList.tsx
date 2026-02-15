import type { Bookmark } from '../types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onSelect: (symbol: string, group: string) => void;
  onRemove: (symbol: string, group: string) => void;
}

export function BookmarkList({ bookmarks, onSelect, onRemove }: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <p className="text-gray-400 text-xs">ブックマークがありません。銘柄を検索して追加してください。</p>
    );
  }

  const grouped = bookmarks.reduce<Record<string, Bookmark[]>>((acc, bookmark) => {
    if (!acc[bookmark.group]) {
      acc[bookmark.group] = [];
    }
    acc[bookmark.group].push(bookmark);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([group, items]) => (
        <section key={group}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {group}
          </h3>
          <div className="flex flex-wrap gap-2">
            {items.map((bookmark) => (
              <span
                key={`${bookmark.group}:${bookmark.symbol}`}
                className="inline-flex items-center bg-blue-50 text-blue-700 text-sm rounded-full px-3 py-1"
              >
                <button
                  onClick={() => onSelect(bookmark.symbol, bookmark.group)}
                  className="hover:underline font-medium"
                >
                  {bookmark.symbol}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(bookmark.symbol, bookmark.group);
                  }}
                  className="ml-1.5 text-blue-400 hover:text-red-500 text-xs leading-none"
                  aria-label={`Remove ${bookmark.symbol} from ${bookmark.group}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
