import React from 'react';

interface ApiKeySetupProps {
  onSave: (key: string) => void;
}

export function ApiKeySetup({ onSave }: ApiKeySetupProps) {
  const [key, setKey] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (trimmed) onSave(trimmed);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold text-gray-800 mb-2">FMP API Key</h2>
      <p className="text-sm text-gray-500 mb-4">
        Financial Modeling Prep の API キーを入力してください。
        <br />
        <a
          href="https://site.financialmodelingprep.com/developer/docs/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          API キーを取得
        </a>
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="API Key"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!key.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存
        </button>
      </form>
    </div>
  );
}
