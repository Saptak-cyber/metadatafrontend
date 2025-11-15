"use client";

import { useState } from "react";
import { X, Plus, Tag } from "lucide-react";

interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
}

export default function TagManager({
  tags,
  onTagsChange,
  suggestions = [],
}: TagManagerProps) {
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setInput("");
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(tags[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newTags = [...tags];
      newTags[editingIndex] = editValue.trim();
      onTagsChange(newTags);
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingIndex !== null) {
        saveEdit();
      } else {
        addTag(input);
      }
    } else if (e.key === "Escape") {
      setEditingIndex(null);
      setEditValue("");
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      setEditingIndex(null);
      setEditValue("");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
        <Tag size={16} />
        Tags
      </label>

      <div className="border border-gray-600 bg-gray-700 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm"
            >
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={saveEdit}
                  className="bg-gray-700 border border-blue-500 text-gray-100 rounded px-2 py-0.5 text-sm w-24 focus:outline-none"
                  autoFocus
                />
              ) : (
                <>
                  <span
                    className="cursor-pointer"
                    onDoubleClick={() => startEdit(index)}
                    title="Double-click to edit"
                  >
                    {tag}
                  </span>
                  <button
                    onClick={() => removeTag(index)}
                    className="hover:text-blue-100 transition-colors"
                    title="Remove tag"
                  >
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add tags..." : "Add more..."}
          className="w-full px-2 py-1 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none text-sm"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-400 mb-1">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((s) => !tags.includes(s))
              .slice(0, 5)
              .map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => addTag(suggestion)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                >
                  <Plus size={12} className="inline mr-1" />
                  {suggestion}
                </button>
              ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Press Enter to add • Double-click to edit • Click X to remove
      </p>
    </div>
  );
}
