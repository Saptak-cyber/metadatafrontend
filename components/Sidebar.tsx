"use client";

import {
  Home,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  FileJson,
  FolderOpen,
  Database,
  HardDrive,
} from "lucide-react";

interface SidebarProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
  stats: {
    postgres: { total: number; byCategory: Record<string, number> };
    mongodb: { total: number; byCategory: Record<string, number> };
    combined: { total: number; byCategory: Record<string, number> };
  };
}

export default function Sidebar({
  onCategorySelect,
  selectedCategory,
  stats,
}: SidebarProps) {
  const categories = [
    { name: "All Files", icon: Home, value: "" },
    { name: "Images", icon: ImageIcon, value: "Images" },
    { name: "Videos", icon: Video, value: "Videos" },
    { name: "Documents", icon: FileText, value: "Documents" },
    { name: "Audio", icon: Music, value: "Audio" },
    { name: "Data", icon: FileJson, value: "Data" },
    { name: "Other", icon: FolderOpen, value: "Other" },
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6 text-gray-100">File Manager</h2>

        <nav className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = category.value
              ? stats.combined.byCategory[category.value] || 0
              : stats.combined.total;

            return (
              <button
                key={category.value}
                onClick={() => onCategorySelect(category.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.value
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium">{category.name}</span>
                </div>
                {count > 0 && (
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Storage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-blue-400" />
                <span className="text-sm text-gray-300">PostgreSQL</span>
              </div>
              <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">
                {stats.postgres.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-green-400" />
                <span className="text-sm text-gray-300">MongoDB</span>
              </div>
              <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">
                {stats.mongodb.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
