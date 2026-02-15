import { useState, useCallback, useMemo } from 'react'
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
  const [isBookmarkPickerOpen, setIsBookmarkPickerOpen] = useState<boolean>(false)
  const [modalSelectedGroups, setModalSelectedGroups] = useState<string[]>([])
  const [newBookmarkGroup, setNewBookmarkGroup] = useState<string>('')

  const { data, loading, error } = useEarnings(apiKey, selectedSymbol)
  const { bookmarks, groups, addBookmark, removeBookmark, isBookmarked } = useBookmarks()
  const bookmarkGroups = useMemo(() => Array.from(new Set(groups)), [groups])
  const selectedSymbolBookmarkGroups = useMemo(
    () => (selectedSymbol ? bookmarks.filter((b) => b.symbol === selectedSymbol).map((b) => b.group) : []),
    [bookmarks, selectedSymbol],
  )

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

  const handleBookmarkSelect = useCallback((symbol: string, _group: string) => {
    setSelectedSymbol(symbol)
    const bookmark = bookmarks.find(b => b.symbol === symbol)
    setSelectedName(bookmark?.name ?? symbol)
  }, [bookmarks])

  const handleToggleBookmark = useCallback(() => {
    if (!selectedSymbol) return
    setModalSelectedGroups(selectedSymbolBookmarkGroups)
    setNewBookmarkGroup('')
    setIsBookmarkPickerOpen(true)
  }, [selectedSymbol, selectedSymbolBookmarkGroups])

  const handleAddToBookmarkGroup = useCallback(() => {
    if (!selectedSymbol) return
    const trimmed = newBookmarkGroup.trim()
    if (!trimmed) return

    setModalSelectedGroups((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setNewBookmarkGroup('')
  }, [selectedSymbol, newBookmarkGroup])

  const handleToggleModalGroup = useCallback((group: string) => {
    setModalSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    )
  }, [])

  const handleSaveBookmarkGroups = useCallback(() => {
    if (!selectedSymbol) return

    const current = new Set(selectedSymbolBookmarkGroups)
    const next = new Set(modalSelectedGroups.map((group) => group.trim()).filter(Boolean))

    current.forEach((group) => {
      if (!next.has(group)) {
        removeBookmark(selectedSymbol, group)
      }
    })

    next.forEach((group) => {
      if (!current.has(group)) {
        addBookmark({ symbol: selectedSymbol, name: selectedName, group })
      }
    })

    setIsBookmarkPickerOpen(false)
  }, [selectedSymbol, selectedName, selectedSymbolBookmarkGroups, modalSelectedGroups, removeBookmark, addBookmark])

  const modalGroupCandidates = useMemo(
    () => Array.from(new Set([...bookmarkGroups, ...modalSelectedGroups])),
    [bookmarkGroups, modalSelectedGroups],
  )

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
          <>
            <StockDetail
              symbol={selectedSymbol}
              name={selectedName}
              bookmarkGroups={selectedSymbolBookmarkGroups}
              isBookmarked={isBookmarked(selectedSymbol)}
              onToggleBookmark={handleToggleBookmark}
              earningsData={data}
              loading={loading}
              error={error}
            />
          </>
        )}
      </main>

      {isBookmarkPickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setIsBookmarkPickerOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white shadow-xl border border-gray-200 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800">BookMark先を選択</h3>
              <button
                onClick={() => setIsBookmarkPickerOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close bookmark group modal"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="block text-xs text-gray-600 mb-1">所属グループを選択</p>
                {modalGroupCandidates.length === 0 ? (
                  <p className="text-xs text-gray-500">まだグループがありません。下で新規作成してください。</p>
                ) : (
                  <div className="max-h-40 overflow-auto border border-gray-200 rounded px-2 py-2 space-y-1">
                    {modalGroupCandidates.map((group) => (
                      <label key={group} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={modalSelectedGroups.includes(group)}
                          onChange={() => handleToggleModalGroup(group)}
                        />
                        <span>{group}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="new-bookmark-group" className="block text-xs text-gray-600 mb-1">新規グループ名（任意）</label>
                <div className="flex items-stretch gap-2">
                  <input
                    id="new-bookmark-group"
                    type="text"
                    value={newBookmarkGroup}
                    onChange={(e) => setNewBookmarkGroup(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddToBookmarkGroup()
                      }
                    }}
                    placeholder="例: Position / WatchList"
                    className="flex-1 min-w-0 text-sm border border-gray-300 rounded px-2 py-2"
                  />
                  <button
                    onClick={handleAddToBookmarkGroup}
                    className="shrink-0 whitespace-nowrap text-sm px-3 py-2 rounded border border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsBookmarkPickerOpen(false)}
                className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveBookmarkGroups}
                className="text-sm px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
