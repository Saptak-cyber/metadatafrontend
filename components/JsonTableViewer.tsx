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
          <div className="text-gray-500 text-center py-8">Empty array</div>
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

      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-gray-300">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-700">
                    {idx}
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-sm text-gray-900">
                      {renderCell(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (typeof data === "object" && data !== null) {
      // Single object - render as key-value table
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-gray-300">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider w-1/3">
                  Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider w-24">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data).map(([key, value]) => (
                <tr key={key} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {key}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {renderCell(value)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-700">
                    {getValueType(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="text-gray-500 text-center py-8">No data to display</div>
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
          className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded group"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-mono text-sm text-gray-600">
            {isArray ? `Array[${obj.length}]` : `Object{${entries.length}}`}
          </span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l-2 border-gray-200 pl-2 mt-1">
            {entries.map(([key, value]) => {
              const currentPath = path ? `${path}.${key}` : String(key);
              const isObject = typeof value === "object" && value !== null;

              return (
                <div key={key} className="py-1">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm text-blue-600 min-w-[100px]">
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
    <div className="bg-white rounded-xl border-2 border-gray-300 shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
              viewMode === "table"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300"
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
                : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300"
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
