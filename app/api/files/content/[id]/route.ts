import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/postgres";
import { connectMongoDB, FileModel } from "@/lib/db/mongodb";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const storageType = searchParams.get("storageType");

    if (!storageType) {
      return NextResponse.json(
        { error: "Storage type is required" },
        { status: 400 }
      );
    }

    let filePath: string | null = null;
    let extension: string | null = null;

    if (storageType === "mongodb") {
      await connectMongoDB();
      const file = await FileModel.findById(id);
      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      filePath = file.filePath;
      extension = file.extension;

      // For JSON files, return the metadata directly
      if (extension === "json" && file.metadata) {
        return NextResponse.json(file.metadata);
      }
    } else {
      const result = await pool.query(
        "SELECT file_path, extension, metadata FROM files WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      filePath = result.rows[0].file_path;
      extension = result.rows[0].extension;

      // For JSON files, return the metadata directly
      if (extension === "json" && result.rows[0].metadata) {
        return NextResponse.json(result.rows[0].metadata);
      }
    }

    // If metadata not available, try reading from file
    if (filePath && extension === "json") {
      const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
      const absolutePath = path.join(process.cwd(), "public", cleanPath);

      try {
        const fileContent = await readFile(absolutePath, "utf-8");
        const jsonData = JSON.parse(fileContent);
        return NextResponse.json(jsonData);
      } catch (error) {
        console.error("Failed to read file:", error);
        return NextResponse.json(
          { error: "Failed to read file content" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Not a JSON file or content not available" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json(
      { error: "Failed to get file content" },
      { status: 500 }
    );
  }
}
