import React from 'react';
import { searchSymbol } from '../services/fmp';
import type { SearchResult } from '../types';

interface SearchBarProps {
  apiKey: string;
  onSelect: (result: SearchResult) => void;
}

export function SearchBar({ apiKey, onSelect }: SearchBarProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchSymbol(apiKey, trimmed);
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : '検索に失敗しました');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [apiKey, query]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="銘柄を検索... (例: AAPL)"
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 text-gray-400 text-xs">検索中...</div>
      )}
      {error && (
        <div className="text-red-500 text-xs mt-1">{error}</div>
      )}
      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-60 overflow-y-auto">
          {results.map((result) => (
            <li
              key={result.symbol}
              onClick={() => handleSelect(result)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50"
            >
              <span className="font-medium text-gray-800">{result.symbol}</span>
              <span className="text-gray-500 ml-2">{result.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
