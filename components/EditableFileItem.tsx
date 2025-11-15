"use client";

import { useState } from "react";
import { X, Edit2, Check } from "lucide-react";

interface EditableFileItemProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
  onRename: (index: number, newName: string) => void;
}

export default function EditableFileItem({
  file,
  index,
  onRemove,
  onRename,
}: EditableFileItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fileName, setFileName] = useState(file.name);
  const [editValue, setEditValue] = useState(file.name);

  const handleSave = () => {
    if (editValue.trim() && editValue !== fileName) {
      setFileName(editValue);
      onRename(index, editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(fileName);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
      <div className="flex-1 min-w-0 mr-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-2 py-1 bg-gray-600 border border-blue-500 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-700 transition-colors"
              title="Save"
            >
              <Check size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate text-gray-100">
              {fileName}
            </p>
            <button
              onClick={() => {
                setEditValue(fileName);
                setIsEditing(true);
              }}
              className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
              title="Rename"
            >
              <Edit2 size={14} />
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="ml-2 text-red-500 hover:text-red-700 transition-colors"
        title="Remove"
      >
        <X size={20} />
      </button>
    </div>
  );
}
