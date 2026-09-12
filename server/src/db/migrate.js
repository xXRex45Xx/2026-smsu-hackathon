import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, closeDatabase } from "./client.js";

try {
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Database migrations complete");
} finally {
  await closeDatabase();
}
