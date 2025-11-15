export interface FileMetadata {
  id?: number | string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  extension: string;
  category: string;
  tags: string[];
  metadata?: any;
  uploadedAt?: Date;
  updatedAt?: Date;
  storageType?: "postgres" | "mongodb";
}

export interface UploadResponse {
  success: boolean;
  file?: FileMetadata;
  error?: string;
  storageType?: "postgres" | "mongodb";
}

export interface SearchParams {
  query?: string;
  tags?: string[];
  category?: string;
  extension?: string;
  limit?: number;
  offset?: number;
}
