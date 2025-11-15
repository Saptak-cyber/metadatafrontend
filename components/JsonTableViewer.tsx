"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Table2, List } from "lucide-react";

interface JsonTableViewerProps {
  data: any;
  title?: string;
}

export default function JsonTableViewer({
  data,
  title = "JSON Data",
}: JsonTableViewerProps) {
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [displayLimit, setDisplayLimit] = useState(50);
  const [showAll, setShowAll] = useState(false);

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderTableView = () => {
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return (
          <div className="text-gray-400 text-center py-8">Empty array</div>
        );
      }

      // Get all unique keys from all objects
      const allKeys = new Set<string>();
      data.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          Object.keys(item).forEach((key) => allKeys.add(key));
        }
      });
      const columns = Array.from(allKeys);

      const itemsToShow = showAll ? data : data.slice(0, displayLimit);
      const hasMore = data.length > displayLimit && !showAll;

      return (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {itemsToShow.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-400">
                      {idx}
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-sm text-gray-200">
                        {renderCell(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="mt-4 text-center border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400 mb-3">
                Showing {displayLimit} of {data.length} items
              </p>
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Show All ({data.length} items)
              </button>
            </div>
          )}
          {showAll && data.length > displayLimit && (
            <div className="mt-4 text-center border-t border-gray-700 pt-4">
              <button
                onClick={() => setShowAll(false)}
                className="px-6 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors font-medium border border-gray-600"
              >
                Show Less
              </button>
            </div>
          )}
        </div>
      );
    } else if (typeof data === "object" && data !== null) {
      // Single object - render as key-value table
      const entries = Object.entries(data);
      const entriesToShow = showAll ? entries : entries.slice(0, displayLimit);
      const hasMore = entries.length > displayLimit && !showAll;

      return (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider w-1/3">
                    Key
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider w-24">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {entriesToShow.map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-200">
                      {key}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-200">
                      {renderCell(value)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-400">
                      {getValueType(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="mt-4 text-center border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400 mb-3">
                Showing {displayLimit} of {entries.length} properties
              </p>
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Show All ({entries.length} properties)
              </button>
            </div>
          )}
          {showAll && entries.length > displayLimit && (
            <div className="mt-4 text-center border-t border-gray-700 pt-4">
              <button
                onClick={() => setShowAll(false)}
                className="px-6 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors font-medium border border-gray-600"
              >
                Show Less
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-gray-400 text-center py-8">No data to display</div>
    );
  };

  const renderCell = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400">[]</span>;
      if (value.every((item) => typeof item !== "object")) {
        return <span className="text-blue-600">[{value.join(", ")}]</span>;
      }
      return <span className="text-purple-600">Array[{value.length}]</span>;
    }

    if (typeof value === "object") {
      return <span className="text-purple-600">Object</span>;
    }

    if (typeof value === "boolean") {
      return <span className="text-orange-600">{value.toString()}</span>;
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>;
    }

    if (typeof value === "string") {
      return <span className="text-green-600">{value}</span>;
    }

    return String(value);
  };

  const getValueType = (value: any): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  };

  const renderTreeView = (obj: any, path = "", level = 0): React.ReactNode => {
    if (obj === null || obj === undefined) {
      return <span className="text-gray-400">null</span>;
    }

    if (typeof obj !== "object") {
      return renderCell(obj);
    }

    const isExpanded = expandedPaths.has(path);
    const isArray = Array.isArray(obj);
    const entries = isArray ? obj.map((v, i) => [i, v]) : Object.entries(obj);

    return (
      <div className={level > 0 ? "ml-6" : ""}>
        <button
          onClick={() => toggleExpand(path)}
          className="flex items-center gap-1 hover:bg-gray-700 px-2 py-1 rounded group"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-mono text-sm text-gray-400">
            {isArray ? `Array[${obj.length}]` : `Object{${entries.length}}`}
          </span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l-2 border-gray-700 pl-2 mt-1">
            {entries.map(([key, value]) => {
              const currentPath = path ? `${path}.${key}` : String(key);
              const isObject = typeof value === "object" && value !== null;

              return (
                <div key={key} className="py-1">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm text-blue-400 min-w-[100px]">
                      {key}:
                    </span>
                    {isObject
                      ? renderTreeView(value, currentPath, level + 1)
                      : renderCell(value)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl border-2 border-gray-700 shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
        <h3 className="font-bold text-gray-100">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
              viewMode === "table"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-gray-600"
            }`}
          >
            <Table2 size={16} />
            Table
          </button>
          <button
            onClick={() => setViewMode("tree")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
              viewMode === "tree"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-gray-600"
            }`}
          >
            <List size={16} />
            Tree
          </button>
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-auto">
        {viewMode === "table" ? renderTableView() : renderTreeView(data)}
      </div>
    </div>
  );
}
