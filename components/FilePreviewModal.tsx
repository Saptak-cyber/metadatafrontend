"use client";

import { FileMetadata } from "@/types/file";
import { X, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import JsonTableViewer from "./JsonTableViewer";

interface FilePreviewModalProps {
  file: FileMetadata | null;
  onClose: () => void;
}

export default function FilePreviewModal({
  file,
  onClose,
}: FilePreviewModalProps) {
  const [content, setContent] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (file && file.category === "Data" && file.extension === "json") {
      // JSON is already parsed in metadata
      setContent(file.metadata);
    }
  }, [file]);

  const handleCopyJson = async () => {
    if (!content && !file?.metadata) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(content || file?.metadata, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!file) return null;

  const renderPreview = () => {
    switch (file.category) {
      case "Images":
        return (
          <img
            src={file.filePath}
            alt={file.originalName}
            className="max-w-full max-h-[70vh] mx-auto object-contain"
          />
        );

      case "Videos":
        return (
          <video
            src={file.filePath}
            controls
            className="max-w-full max-h-[70vh] mx-auto"
          >
            Your browser does not support video playback.
          </video>
        );

      case "Audio":
        return (
          <div className="p-8">
            <audio src={file.filePath} controls className="w-full">
              Your browser does not support audio playback.
            </audio>
          </div>
        );

      case "Data":
        if (file.extension === "json") {
          return (
            <div className="space-y-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-medium shadow-sm hover:shadow"
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy JSON
                    </>
                  )}
                </button>
              </div>
              <JsonTableViewer
                data={content || file.metadata}
                title={file.originalName}
              />
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-800 hover:text-gray-900 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300">
                  View Raw JSON
                </summary>
                <div className="mt-2 max-h-[40vh] overflow-auto p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm shadow-inner">
                  <pre>{JSON.stringify(content || file.metadata, null, 2)}</pre>
                </div>
              </details>
            </div>
          );
        }
        return (
          <div className="p-8 text-center text-gray-500">
            Preview not available for this file type
          </div>
        );

      default:
        return (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              Preview not available for this file type
            </p>
            <a
              href={file.filePath}
              download={file.originalName}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Download File
            </a>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800 truncate">
              {file.originalName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 font-medium">
              <span className="uppercase bg-white px-2 py-0.5 rounded">
                {file.extension}
              </span>
              <span>•</span>
              <span>{file.category}</span>
              {file.storageType && (
                <>
                  <span>•</span>
                  <span className="bg-white px-2 py-0.5 rounded">
                    {file.storageType === "mongodb" ? "MongoDB" : "PostgreSQL"}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg p-1.5 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{renderPreview()}</div>

        {file.tags && file.tags.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <p className="text-sm font-semibold text-gray-800 mb-2">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {file.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
