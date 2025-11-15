"use client";

import { FileMetadata } from "@/types/file";
import { formatFileSize } from "@/lib/utils";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileJson,
  File as FileIcon,
  Download,
  Eye,
  Database,
} from "lucide-react";

interface FileCardProps {
  file: FileMetadata;
  onPreview: (file: FileMetadata) => void;
}

export default function FileCard({ file, onPreview }: FileCardProps) {
  const getFileIcon = () => {
    switch (file.category) {
      case "Images":
        return <ImageIcon className="text-green-500" size={40} />;
      case "Videos":
        return <Video className="text-purple-500" size={40} />;
      case "Audio":
        return <Music className="text-pink-500" size={40} />;
      case "Data":
        return <FileJson className="text-blue-500" size={40} />;
      case "Documents":
        return <FileText className="text-orange-500" size={40} />;
      default:
        return <FileIcon className="text-gray-500" size={40} />;
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(file.filePath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-xl hover:shadow-blue-900/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="shrink-0">{getFileIcon()}</div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPreview(file)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Preview"
          >
            <Eye size={18} className="text-gray-400" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Download"
          >
            <Download size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      <h3
        className="font-medium text-sm truncate mb-1 text-gray-100"
        title={file.originalName}
      >
        {file.originalName}
      </h3>

      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <span>{formatFileSize(file.fileSize)}</span>
        <span>•</span>
        <span className="uppercase">{file.extension}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-block px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
          {file.category}
        </span>
        <div
          className="flex items-center gap-1"
          title={`Stored in ${
            file.storageType === "mongodb" ? "MongoDB" : "PostgreSQL"
          }`}
        >
          <Database
            size={12}
            className={
              file.storageType === "mongodb"
                ? "text-green-400"
                : "text-blue-400"
            }
          />
          <span className="text-xs text-gray-400">
            {file.storageType === "mongodb" ? "Mongo" : "Postgres"}
          </span>
        </div>
      </div>

      {file.tags && file.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {file.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {file.tags.length > 3 && (
            <span className="inline-block px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
              +{file.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
