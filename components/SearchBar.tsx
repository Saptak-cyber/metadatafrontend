"use client";

import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  categories: string[];
  extensions: string[];
}

export interface SearchFilters {
  query: string;
  category: string;
  extension: string;
  tags: string[];
}

export default function SearchBar({
  onSearch,
  categories,
  extensions,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("");
  const [extension, setExtension] = useState("");
  const [tags, setTags] = useState("");

  const handleSearch = () => {
    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSearch(query, { query, category, extension, tags: tagArray });
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setExtension("");
    setTags("");
    onSearch("", { query: "", category: "", extension: "", tags: [] });
  };

  const hasActiveFilters = category || extension || tags;

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-blue-600 border-blue-500 text-white"
                : "border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Filter size={20} />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {[category, extension, tags].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  File Type
                </label>
                <select
                  value={extension}
                  onChange={(e) => setExtension(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {extensions.map((ext) => (
                    <option key={ext} value={ext}>
                      .{ext}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <X size={16} />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
