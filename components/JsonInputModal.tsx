"use client";

import { useState } from "react";
import { FileJson, X, Upload } from "lucide-react";

interface JsonInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jsonData: any, fileName: string) => void;
  initialContent?: string;
  initialFileName?: string;
  initialError?: string;
}

export default function JsonInputModal({
  isOpen,
  onClose,
  onSubmit,
  initialContent = "",
  initialFileName = "custom-data.json",
  initialError = "",
}: JsonInputModalProps) {
  const [jsonText, setJsonText] = useState(initialContent);
  const [fileName, setFileName] = useState(initialFileName);
  const [error, setError] = useState(initialError);

  // Update when initial values change
  useState(() => {
    if (isOpen) {
      setJsonText(initialContent);
      setFileName(initialFileName);
      setError(initialError);
    }
  });

  const handleSubmit = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError("");
      onSubmit(parsed, fileName);
      setJsonText("");
      setFileName("custom-data.json");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON format");
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON format");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center gap-3">
            <FileJson className="text-blue-400" size={24} />
            <h2 className="text-xl font-semibold text-gray-100">
              Type JSON Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-lg p-1.5 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="my-data.json"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                JSON Content
              </label>
              <button
                onClick={formatJson}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Format JSON
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError("");
              }}
              className="w-full h-96 px-4 py-3 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={`{\n  "name": "Example",\n  "data": [\n    { "id": 1, "value": "test" }\n  ]\n}`}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          )}

          <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Tips:</h4>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• Paste or type valid JSON data</li>
              <li>• Use "Format JSON" to auto-format your input</li>
              <li>
                • Nested objects will be stored in MongoDB for flexible querying
              </li>
              <li>• You'll see a schema preview before uploading</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!jsonText.trim() || !fileName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload size={18} />
            Preview & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
