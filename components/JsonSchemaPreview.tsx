"use client";

import { useState, useEffect } from "react";
import { FileJson, AlertTriangle, CheckCircle, X } from "lucide-react";

interface JsonSchemaPreviewProps {
  jsonContent: any;
  fileName: string;
  onConfirm: () => void;
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
      return (
        <div className="ml-4">
          <span className="text-gray-400">[</span>
          {data.slice(0, 3).map((item, idx) => (
            <div key={idx} className="ml-4">
              {renderSchemaTree(item, level + 1)}
              {idx < Math.min(data.length - 1, 2) && (
                <span className="text-gray-400">,</span>
              )}
            </div>
          ))}
          {data.length > 3 && (
            <div className="ml-4 text-gray-500">
              ... {data.length - 3} more items
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <FileJson className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold">JSON Schema Preview</h2>
              <p className="text-sm text-gray-600">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Schema Analysis */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              Schema Analysis
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Fields:</span>
                  <span className="ml-2 font-semibold">{schema.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Root Keys:</span>
                  <span className="ml-2 font-semibold">{rootKeys.length}</span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Root Fields:</p>
                <div className="flex flex-wrap gap-2">
                  {rootKeys.map((field, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
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
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" size={20} />
                Similar Schemas Detected
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Found {similarSchemas.length} existing file(s) with similar
                  schema. Would you like to merge?
                </p>
                <div className="space-y-2">
                  {similarSchemas.map((schema) => (
                    <label
                      key={schema.id}
                      className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
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
                        <p className="text-sm font-medium">{schema.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round(schema.similarity)}% similar schema
                        </p>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="merge-option"
                      value="new"
                      checked={selectedMerge === "new"}
                      onChange={(e) => setSelectedMerge(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Create as new separate instance
                      </p>
                      <p className="text-xs text-gray-500">
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
            <h3 className="text-lg font-semibold mb-3">Data Preview</h3>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
              {renderSchemaTree(jsonContent)}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={
              similarSchemas && similarSchemas.length > 0 && !selectedMerge
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
