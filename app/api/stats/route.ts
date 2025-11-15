import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/postgres";
import { connectMongoDB, FileModel } from "@/lib/db/mongodb";

export async function GET(request: NextRequest) {
  try {
    const stats = {
      postgres: {
        total: 0,
        byCategory: {} as Record<string, number>,
        byExtension: {} as Record<string, number>,
      },
      mongodb: {
        total: 0,
        byCategory: {} as Record<string, number>,
        byExtension: {} as Record<string, number>,
      },
      combined: {
        total: 0,
        byCategory: {} as Record<string, number>,
        byExtension: {} as Record<string, number>,
      },
    };

    // PostgreSQL stats
    try {
      const countResult = await pool.query("SELECT COUNT(*) FROM files");
      stats.postgres.total = parseInt(countResult.rows[0].count);

      const categoryResult = await pool.query(
        "SELECT category, COUNT(*) as count FROM files GROUP BY category"
      );
      categoryResult.rows.forEach((row: any) => {
        stats.postgres.byCategory[row.category] = parseInt(row.count);
      });

      const extensionResult = await pool.query(
        "SELECT extension, COUNT(*) as count FROM files GROUP BY extension"
      );
      extensionResult.rows.forEach((row: any) => {
        stats.postgres.byExtension[row.extension] = parseInt(row.count);
      });
    } catch (error) {
      console.error("PostgreSQL stats error:", error);
    }

    // MongoDB stats
    try {
      await connectMongoDB();

      stats.mongodb.total = await FileModel.countDocuments();

      const categoryAgg = await FileModel.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);
      categoryAgg.forEach((item) => {
        stats.mongodb.byCategory[item._id] = item.count;
      });

      const extensionAgg = await FileModel.aggregate([
        { $group: { _id: "$extension", count: { $sum: 1 } } },
      ]);
      extensionAgg.forEach((item) => {
        stats.mongodb.byExtension[item._id] = item.count;
      });
    } catch (error) {
      console.error("MongoDB stats error:", error);
    }

    // Combined stats
    stats.combined.total = stats.postgres.total + stats.mongodb.total;

    const allCategories = new Set([
      ...Object.keys(stats.postgres.byCategory),
      ...Object.keys(stats.mongodb.byCategory),
    ]);
    allCategories.forEach((category) => {
      stats.combined.byCategory[category] =
        (stats.postgres.byCategory[category] || 0) +
        (stats.mongodb.byCategory[category] || 0);
    });

    const allExtensions = new Set([
      ...Object.keys(stats.postgres.byExtension),
      ...Object.keys(stats.mongodb.byExtension),
    ]);
    allExtensions.forEach((extension) => {
      stats.combined.byExtension[extension] =
        (stats.postgres.byExtension[extension] || 0) +
        (stats.mongodb.byExtension[extension] || 0);
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
