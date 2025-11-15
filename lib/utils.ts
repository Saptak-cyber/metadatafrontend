import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename
    .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
    .toLowerCase();
}

export function getFileCategory(extension: string): string {
  const categories: Record<string, string[]> = {
    Images: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"],
    Videos: ["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"],
    Documents: ["pdf", "doc", "docx", "txt", "rtf", "odt"],
    Spreadsheets: ["xls", "xlsx", "csv", "ods"],
    Archives: ["zip", "rar", "7z", "tar", "gz"],
    Code: [
      "js",
      "ts",
      "jsx",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "cs",
      "php",
      "rb",
      "go",
    ],
    Data: ["json", "xml", "yaml", "yml", "sql"],
    Audio: ["mp3", "wav", "ogg", "flac", "aac"],
  };

  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(extension)) {
      return category;
    }
  }

  return "Other";
}
