"use client";

import { useState, useEffect } from "react";
import { FileJson, AlertTriangle, CheckCircle, X } from "lucide-react";

interface JsonSchemaPreviewProps {
  jsonContent: any;
  fileName: string;
  onConfirm: (mergeWithId?: string) => void;
  onCancel: () => void;
  similarSchemas?: Array<{ fileName: string; similarity: number; id: string }>;
}

export default function JsonSchemaPreview({
  jsonContent,
  fileName,
  onConfirm,
  onCancel,
  similarSchemas,
}: JsonSchemaPreviewProps) {
  const [selectedMerge, setSelectedMerge] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const analyzeSchema = (
    obj: any,
    path = ""
  ): Array<{ key: string; type: string; path: string }> => {
    const schema: Array<{ key: string; type: string; path: string }> = [];

    if (obj === null || obj === undefined) return schema;

    if (Array.isArray(obj)) {
      schema.push({
        key: path || "root",
        type: `Array[${obj.length}]`,
        path: path || "root",
      });
      if (obj.length > 0) {
        const sample = analyzeSchema(obj[0], `${path}[0]`);
        schema.push(...sample);
      }
    } else if (typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        const valueType = Array.isArray(value)
          ? `Array[${value.length}]`
          : value === null
          ? "null"
          : typeof value;

        schema.push({
          key,
          type: valueType,
          path: currentPath,
        });

        if (typeof value === "object" && value !== null) {
          schema.push(...analyzeSchema(value, currentPath));
        }
      }
    }

    return schema;
  };

  const schema = analyzeSchema(jsonContent);
  const rootKeys = schema.filter(
    (s) => !s.path.includes(".") && !s.path.includes("[")
  );

  const renderSchemaTree = (data: any, level = 0): React.ReactElement => {
    if (data === null || data === undefined) {
      return <span className="text-gray-400">null</span>;
    }

    if (typeof data !== "object") {
      return (
        <span
          className={`${
            typeof data === "string"
              ? "text-green-400"
              : typeof data === "number"
              ? "text-blue-400"
              : typeof data === "boolean"
              ? "text-purple-400"
              : "text-gray-400"
          }`}
        >
          {JSON.stringify(data)}
        </span>
      );
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return <span className="text-gray-400">[]</span>;

      const itemsToShow = showFullPreview ? data : data.slice(0, 3);
      const hasMore = data.length > 3 && !showFullPreview;

      return (
        <div className="ml-4">
          <span className="text-gray-400">[</span>
          {itemsToShow.map((item, idx) => (
            <div key={idx} className="ml-4">
              {renderSchemaTree(item, level + 1)}
              {idx < itemsToShow.length - 1 && (
                <span className="text-gray-400">,</span>
              )}
            </div>
          ))}
          {hasMore && (
            <div className="ml-4">
              <button
                onClick={() => setShowFullPreview(true)}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                ... show {data.length - 3} more items
              </button>
            </div>
          )}
          {showFullPreview && data.length > 3 && (
            <div className="ml-4">
              <button
                onClick={() => setShowFullPreview(false)}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                show less
              </button>
            </div>
          )}
          <span className="text-gray-400">]</span>
        </div>
      );
    }

    const entries = Object.entries(data);
    if (entries.length === 0)
      return <span className="text-gray-400">{"{}"}</span>;

    return (
      <div className={level > 0 ? "ml-4" : ""}>
        <span className="text-gray-400">{"{"}</span>
        {entries.map(([key, value], idx) => (
          <div key={key} className="ml-4">
            <span className="text-cyan-400">"{key}"</span>
            <span className="text-gray-400">: </span>
            {renderSchemaTree(value, level + 1)}
            {idx < entries.length - 1 && (
              <span className="text-gray-400">,</span>
            )}
          </div>
        ))}
        <span className="text-gray-400">{"}"}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center gap-3">
            <FileJson className="text-blue-400" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-100">
                JSON Schema Preview
              </h2>
              <p className="text-sm text-gray-400">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-lg p-1.5 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Schema Analysis */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-100">
              <CheckCircle className="text-green-400" size={20} />
              Schema Analysis
            </h3>
            <div className="bg-gray-700 rounded-lg p-4 space-y-2 border border-gray-600">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Total Fields:</span>
                  <span className="ml-2 font-semibold text-gray-100">
                    {schema.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Root Keys:</span>
                  <span className="ml-2 font-semibold text-gray-100">
                    {rootKeys.length}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Root Fields:</p>
                <div className="flex flex-wrap gap-2">
                  {rootKeys.map((field, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-full"
                    >
                      {field.key}:{" "}
                      <span className="font-mono">{field.type}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Schemas Warning */}
          {similarSchemas && similarSchemas.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-100">
                <AlertTriangle className="text-yellow-400" size={20} />
                Similar Schemas Detected
              </h3>
              <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-3">
                  Found {similarSchemas.length} existing file(s) with similar
                  schema. Would you like to merge?
                </p>
                <div className="space-y-2">
                  {similarSchemas.map((schema) => (
                    <label
                      key={schema.id}
                      className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="merge-option"
                        value={schema.id}
                        checked={selectedMerge === schema.id}
                        onChange={(e) => setSelectedMerge(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-100">
                          {schema.fileName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {Math.round(schema.similarity)}% similar schema
                        </p>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center gap-3 p-3 bg-gray-700 rounded border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="merge-option"
                      value="new"
                      checked={selectedMerge === "new"}
                      onChange={(e) => setSelectedMerge(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-100">
                        Create as new separate instance
                      </p>
                      <p className="text-xs text-gray-400">
                        Don't merge with existing data
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* JSON Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-100">
              Data Preview
            </h3>
            <div className="bg-gray-950 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto border border-gray-700">
              {renderSchemaTree(jsonContent)}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border-2 border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedMerge === "new" || !selectedMerge) {
                onConfirm();
              } else {
                onConfirm(selectedMerge);
              }
            }}
            disabled={
              similarSchemas && similarSchemas.length > 0 && !selectedMerge
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {selectedMerge === "new" ||
            !similarSchemas ||
            similarSchemas.length === 0
              ? "Upload as New"
              : selectedMerge
              ? "Merge and Upload"
              : "Select an Option"}
          </button>
        </div>
      </div>
    </div>
  );
}
