import { Pool } from "pg";
import mongoose from "mongoose";

async function testConnections() {
  console.log("🔍 Testing database connections...\n");

  // Test PostgreSQL
  console.log("📊 Testing PostgreSQL...");
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected successfully!");
    console.log("   Server time:", result.rows[0].now);

    // Check if tables exist
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    console.log(
      "   Tables:",
      tables.rows.length > 0
        ? tables.rows.map((r) => r.tablename).join(", ")
        : "none (will be created on first upload)"
    );

    client.release();
    await pool.end();
  } catch (error) {
    console.log("❌ PostgreSQL connection failed!");
    console.log("   Error:", error instanceof Error ? error.message : error);
    console.log(
      "   Connection string:",
      process.env.POSTGRES_URL?.replace(/:[^:]*@/, ":****@")
    );
  }

  console.log("");

  // Test MongoDB
  console.log("📊 Testing MongoDB...");
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ MongoDB connected successfully!");
    console.log("   Database:", mongoose.connection.db?.databaseName);

    // Check collections
    const collections = await mongoose.connection.db
      ?.listCollections()
      .toArray();
    console.log(
      "   Collections:",
      collections && collections.length > 0
        ? collections.map((c) => c.name).join(", ")
        : "none (will be created on first upload)"
    );

    await mongoose.connection.close();
  } catch (error) {
    console.log("❌ MongoDB connection failed!");
    console.log("   Error:", error instanceof Error ? error.message : error);
    console.log(
      "   Connection string:",
      process.env.MONGODB_URI?.replace(/:[^:]*@/, ":****@")
    );
  }

  console.log("\n✨ Connection test complete!\n");
}

testConnections().catch(console.error);
