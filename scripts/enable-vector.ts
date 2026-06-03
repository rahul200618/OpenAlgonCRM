import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set in environment variables!");
  process.exit(1);
}

async function main() {
  console.log("Connecting to database to enable pgvector...");
  const pool = new Pool({ connectionString });
  
  try {
    const client = await pool.connect();
    console.log("Connected successfully. Running CREATE EXTENSION...");
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    console.log("pgvector extension enabled successfully!");
    client.release();
  } catch (err) {
    console.error("Error enabling pgvector extension:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
