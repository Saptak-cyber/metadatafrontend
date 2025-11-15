import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function initPostgresDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        extension VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        metadata JSONB,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better search performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_files_extension ON files(extension)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_files_category ON files(category)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING GIN(tags)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_files_metadata ON files USING GIN(metadata)
    `);

    console.log("PostgreSQL database initialized successfully");
  } finally {
    client.release();
  }
}

export default pool;
