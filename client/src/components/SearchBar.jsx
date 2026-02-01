import { useState, useEffect } from "react";

export default function SearchBar({
  onSearchChange,
  searchQuery,
  compact = false,
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery || "");

  // Debounce search - wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(localQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, onSearchChange]);

  const handleClear = () => {
    setLocalQuery("");
  };

  // Compact variant for header
  if (compact) {
    return (
      <div className="header-search" style={{ position: "relative" }}>
        <span className="compact-search-icon">🔍</span>
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search farmers..."
          className="compact-search-input"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors p-1"
            title="Clear search"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  // Original full variant for sidebar (if needed)
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-brown-200 shadow-lg">
      <div className="mb-2">
        <label className="block text-xs font-semibold text-brown-600 mb-1 ml-1 flex items-center gap-2">
          <span>🔍</span>
          <span>Search Farmers</span>
        </label>
      </div>

      <div className="relative">
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search by farmer name..."
          className="w-full px-3 py-2 pr-10 bg-white border border-brown-300 rounded-lg text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400"
        />

        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors p-1"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {localQuery && (
        <div className="mt-2 text-xs text-green-600 font-medium">
          Searching for "{localQuery}"...
        </div>
      )}
    </div>
  );
}
