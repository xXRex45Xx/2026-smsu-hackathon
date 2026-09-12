import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://skillbridge:skillbridge@127.0.0.1:5433/skillbridge",
});

export const db = drizzle(pool);

export async function closeDatabase() {
  await pool.end();
}
