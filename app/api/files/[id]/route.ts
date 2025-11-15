import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/postgres";
import { connectMongoDB, FileModel } from "@/lib/db/mongodb";
import { unlink, rename as fsRename } from "fs/promises";
import path from "path";

// Merge two JSON values intelligently based on their types
function mergeJson(existing: any, incoming: any) {
  // If both are arrays, concatenate
  if (Array.isArray(existing) && Array.isArray(incoming)) {
    return [...existing, ...incoming];
  }

  // If both are plain objects, shallow merge keys
  if (
    existing &&
    typeof existing === "object" &&
    !Array.isArray(existing) &&
    incoming &&
    typeof incoming === "object" &&
    !Array.isArray(incoming)
  ) {
    return { ...existing, ...incoming };
  }

  // Types differ or unsupported: wrap into an object so nothing is lost
  return {
    existing,
    incoming,
  };
}

export async function DELETE(
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

    if (storageType === "mongodb") {
      await connectMongoDB();
      const file = await FileModel.findById(id);
      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      filePath = file.filePath;
      await FileModel.findByIdAndDelete(id);
    } else {
      const result = await pool.query(
        "SELECT file_path FROM files WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      filePath = result.rows[0].file_path;
      await pool.query("DELETE FROM files WHERE id = $1", [id]);
    }

    // Delete physical file
    if (filePath) {
      // Remove leading slash if present since path.join handles it
      const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
      const absolutePath = path.join(process.cwd(), "public", cleanPath);
      console.log("Attempting to delete file:", {
        originalPath: filePath,
        cleanPath,
        absolutePath,
        cwd: process.cwd(),
      });
      try {
        await unlink(absolutePath);
        console.log("File deleted successfully:", absolutePath);
      } catch (error: any) {
        console.error("Failed to delete physical file:", {
          error: error.message,
          code: error.code,
          path: absolutePath,
        });
        // Don't fail the request if file deletion fails
      }
    }

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { storageType, newName } = body;

    if (!storageType || !newName) {
      return NextResponse.json(
        { error: "Storage type and new name are required" },
        { status: 400 }
      );
    }

    if (storageType === "mongodb") {
      await connectMongoDB();
      const file = await FileModel.findById(id);
      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const oldPath = file.filePath;
      const cleanOldPath = oldPath.startsWith("/") ? oldPath.slice(1) : oldPath;
      const absoluteOldPath = path.join(process.cwd(), "public", cleanOldPath);

      // Generate new path with same directory but new filename
      const directory = path.dirname(cleanOldPath);
      const newFileName = newName;
      const newFilePath = `/${directory}/${newFileName}`;
      const absoluteNewPath = path.join(
        process.cwd(),
        "public",
        directory,
        newFileName
      );

      // Rename physical file
      try {
        await fsRename(absoluteOldPath, absoluteNewPath);
      } catch (error: any) {
        console.error("Failed to rename physical file:", error);
        return NextResponse.json(
          { error: "Failed to rename file on disk" },
          { status: 500 }
        );
      }

      // Update database
      file.originalName = newFileName;
      file.filePath = newFilePath;
      file.updatedAt = new Date();
      await file.save();

      return NextResponse.json({
        message: "File renamed successfully",
        file: file.toObject(),
      });
    } else {
      const result = await pool.query(
        "SELECT original_name, file_path FROM files WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const oldPath = result.rows[0].file_path;
      const cleanOldPath = oldPath.startsWith("/") ? oldPath.slice(1) : oldPath;
      const absoluteOldPath = path.join(process.cwd(), "public", cleanOldPath);

      // Generate new path
      const directory = path.dirname(cleanOldPath);
      const newFileName = newName;
      const newFilePath = `/${directory}/${newFileName}`;
      const absoluteNewPath = path.join(
        process.cwd(),
        "public",
        directory,
        newFileName
      );

      // Rename physical file
      try {
        await fsRename(absoluteOldPath, absoluteNewPath);
      } catch (error: any) {
        console.error("Failed to rename physical file:", error);
        return NextResponse.json(
          { error: "Failed to rename file on disk" },
          { status: 500 }
        );
      }

      // Update database
      await pool.query(
        "UPDATE files SET original_name = $1, file_path = $2, updated_at = NOW() WHERE id = $3",
        [newFileName, newFilePath, id]
      );

      return NextResponse.json({
        message: "File renamed successfully",
      });
    }
  } catch (error) {
    console.error("Rename error:", error);
    return NextResponse.json(
      { error: "Failed to rename file" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { storageType, mergeData } = body;

    if (!storageType) {
      return NextResponse.json(
        { error: "Storage type is required" },
        { status: 400 }
      );
    }

    if (storageType === "mongodb") {
      await connectMongoDB();
      const file = await FileModel.findById(id);
      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      // For JSON files, merge the actual content
      if (file.extension === "json") {
        const mergedData = mergeJson(file.metadata, mergeData);
        file.metadata = mergedData;
        file.updatedAt = new Date();
        await file.save();

        // Update the physical JSON file
        const cleanPath = file.filePath.startsWith("/")
          ? file.filePath.slice(1)
          : file.filePath;
        const absolutePath = path.join(process.cwd(), "public", cleanPath);
        try {
          const fs = require("fs").promises;
          await fs.writeFile(
            absolutePath,
            JSON.stringify(mergedData, null, 2),
            "utf-8"
          );
        } catch (error) {
          console.error("Failed to update physical file:", error);
        }
      } else {
        // For non-JSON files, just update metadata
        const mergedMetadata = { ...file.metadata, ...mergeData };
        file.metadata = mergedMetadata;
        file.updatedAt = new Date();
        await file.save();
      }

      return NextResponse.json({
        message: "Data merged successfully",
        file: file.toObject(),
      });
    } else {
      const result = await pool.query(
        "SELECT metadata, extension, file_path FROM files WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const {
        metadata: existingMetadata,
        extension,
        file_path,
      } = result.rows[0];

      // For JSON files, merge the actual content
      if (extension === "json") {
        const mergedData = mergeJson(existingMetadata, mergeData);

        // Update the metadata in database
        await pool.query(
          "UPDATE files SET metadata = $1, updated_at = NOW() WHERE id = $2",
          [mergedData, id]
        );

        // Update the physical JSON file
        const cleanPath = file_path.startsWith("/")
          ? file_path.slice(1)
          : file_path;
        const absolutePath = path.join(process.cwd(), "public", cleanPath);
        try {
          const fs = require("fs").promises;
          await fs.writeFile(
            absolutePath,
            JSON.stringify(mergedData, null, 2),
            "utf-8"
          );
        } catch (error) {
          console.error("Failed to update physical file:", error);
        }
      } else {
        // For non-JSON files, just update metadata
        const mergedMetadata = { ...existingMetadata, ...mergeData };
        await pool.query(
          "UPDATE files SET metadata = $1, updated_at = NOW() WHERE id = $2",
          [mergedMetadata, id]
        );
      }

      return NextResponse.json({
        message: "Data merged successfully",
      });
    }
  } catch (error) {
    console.error("Merge error:", error);
    return NextResponse.json(
      { error: "Failed to merge data" },
      { status: 500 }
    );
  }
}
