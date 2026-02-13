import type { EarningsData } from '../types';
import { EpsTable } from './EpsTable';

interface StockDetailProps {
  symbol: string;
  name: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  earningsData: EarningsData | null;
  loading: boolean;
  error: string | null;
}

function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}兆 USD`;
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}億 USD`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(2)}万 USD`;
  return `${value.toLocaleString('en-US')} USD`;
}

export function StockDetail({
  symbol,
  name,
  isBookmarked,
  onToggleBookmark,
  earningsData,
  loading,
  error,
}: StockDetailProps) {
  const marketCap = earningsData?.marketCap ?? null;
  const ipoDate = earningsData?.ipoDate ?? null;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{symbol}</h2>
          {marketCap !== null && (
            <p className="text-sm text-gray-500 mt-1">Market Cap: {formatMarketCap(marketCap)}</p>
          )}
          {ipoDate && (
            <p className="text-sm text-gray-500 mt-1">IPO Date: {ipoDate}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">{name}</span>
          <button
            onClick={onToggleBookmark}
            className="text-xl hover:scale-110 transition-transform"
            aria-label={isBookmarked ? 'ブックマーク解除' : 'ブックマーク追加'}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 py-8">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm">データを読み込み中...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 rounded px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {earningsData && (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            EPS推移
            <span className="text-xs font-normal text-gray-400 ml-2">GAAP Diluted</span>
          </h3>
          <EpsTable
            quarterly={earningsData.quarterly}
            annual={earningsData.annual}
          />
        </section>
      )}
    </div>
  );
}
