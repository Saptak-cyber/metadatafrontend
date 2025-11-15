import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/postgres";
import { connectMongoDB, FileModel } from "@/lib/db/mongodb";
import { FileMetadata } from "@/types/file";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const category = searchParams.get("category") || "";
    const extension = searchParams.get("extension") || "";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let postgresFiles: FileMetadata[] = [];
    let mongoFiles: FileMetadata[] = [];

    // Search PostgreSQL
    try {
      let pgQuery = "SELECT * FROM files WHERE 1=1";
      const pgParams: any[] = [];
      let paramIndex = 1;

      if (query) {
        pgQuery += ` AND (original_name ILIKE $${paramIndex} OR metadata::text ILIKE $${paramIndex})`;
        pgParams.push(`%${query}%`);
        paramIndex++;
      }

      if (tags.length > 0) {
        pgQuery += ` AND tags && $${paramIndex}::text[]`;
        pgParams.push(tags);
        paramIndex++;
      }

      if (category) {
        pgQuery += ` AND category = $${paramIndex}`;
        pgParams.push(category);
        paramIndex++;
      }

      if (extension) {
        pgQuery += ` AND extension = $${paramIndex}`;
        pgParams.push(extension);
        paramIndex++;
      }

      pgQuery += ` ORDER BY uploaded_at DESC LIMIT $${paramIndex} OFFSET $${
        paramIndex + 1
      }`;
      pgParams.push(limit, offset);

      const result = await pool.query(pgQuery, pgParams);
      postgresFiles = result.rows.map((row: any) => ({
        id: row.id,
        filename: row.filename,
        originalName: row.original_name,
        filePath: row.file_path,
        fileSize: parseInt(row.file_size),
        mimeType: row.mime_type,
        extension: row.extension,
        category: row.category,
        tags: row.tags || [],
        metadata: row.metadata,
        uploadedAt: row.uploaded_at,
        updatedAt: row.updated_at,
        storageType: "postgres" as const,
      }));
    } catch (error) {
      console.error("PostgreSQL search error:", error);
    }

    // Search MongoDB
    try {
      await connectMongoDB();

      const mongoQuery: any = {};

      if (query) {
        mongoQuery.$or = [
          { originalName: { $regex: query, $options: "i" } },
          { metadata: { $regex: query, $options: "i" } },
        ];
      }

      if (tags.length > 0) {
        mongoQuery.tags = { $in: tags };
      }

      if (category) {
        mongoQuery.category = category;
      }

      if (extension) {
        mongoQuery.extension = extension;
      }

      const docs = await FileModel.find(mongoQuery)
        .sort({ uploadedAt: -1 })
        .limit(limit)
        .skip(offset);

      mongoFiles = docs.map((doc) => ({
        id: doc._id.toString(),
        filename: doc.filename,
        originalName: doc.originalName,
        filePath: doc.filePath,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        extension: doc.extension,
        category: doc.category,
        tags: doc.tags || [],
        metadata: doc.metadata,
        uploadedAt: doc.uploadedAt,
        updatedAt: doc.updatedAt,
        storageType: "mongodb" as const,
      }));
    } catch (error) {
      console.error("MongoDB search error:", error);
    }

    // Combine and sort results
    const allFiles = [...postgresFiles, ...mongoFiles].sort((a, b) => {
      const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      files: allFiles,
      total: allFiles.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        error: "Failed to search files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
