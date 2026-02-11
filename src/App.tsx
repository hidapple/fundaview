import { useState, useCallback } from 'react'
import { useEarnings } from './hooks/useEarnings'
import { useBookmarks } from './hooks/useBookmarks'
import { ApiKeySetup } from './components/ApiKeySetup'
import { SearchBar } from './components/SearchBar'
import { BookmarkList } from './components/BookmarkList'
import { StockDetail } from './components/StockDetail'
import { getApiKey, setApiKey, removeApiKey } from './services/storage'
import type { SearchResult } from './types'

export function App() {
  const [apiKey, setApiKeyState] = useState<string | null>(getApiKey)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string>('')

  const { data, loading, error } = useEarnings(apiKey, selectedSymbol)
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks()

  const handleSaveApiKey = useCallback((key: string) => {
    setApiKey(key)
    setApiKeyState(key)
  }, [])

  const handleRemoveApiKey = useCallback(() => {
    removeApiKey()
    setApiKeyState(null)
  }, [])

  const handleSelect = useCallback((result: SearchResult) => {
    setSelectedSymbol(result.symbol)
    setSelectedName(result.name)
  }, [])

  const handleBookmarkSelect = useCallback((symbol: string) => {
    setSelectedSymbol(symbol)
    const bookmark = bookmarks.find(b => b.symbol === symbol)
    setSelectedName(bookmark?.name ?? symbol)
  }, [bookmarks])

  const handleToggleBookmark = useCallback(() => {
    if (!selectedSymbol) return
    if (isBookmarked(selectedSymbol)) {
      removeBookmark(selectedSymbol)
    } else {
      addBookmark({ symbol: selectedSymbol, name: selectedName })
    }
  }, [selectedSymbol, selectedName, isBookmarked, removeBookmark, addBookmark])

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <h1 className="text-xl font-bold text-gray-800">FundaView</h1>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          <ApiKeySetup onSave={handleSaveApiKey} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">FundaView</h1>
          <button
            onClick={handleRemoveApiKey}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            API Key変更
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4">
          <SearchBar apiKey={apiKey} onSelect={handleSelect} />
        </div>

        <div className="mb-6">
          <BookmarkList
            bookmarks={bookmarks}
            onSelect={handleBookmarkSelect}
            onRemove={removeBookmark}
          />
        </div>

        {selectedSymbol && (
          <StockDetail
            symbol={selectedSymbol}
            name={selectedName}
            isBookmarked={isBookmarked(selectedSymbol)}
            onToggleBookmark={handleToggleBookmark}
            earningsData={data}
            loading={loading}
            error={error}
          />
        )}
      </main>
    </div>
  )
}
