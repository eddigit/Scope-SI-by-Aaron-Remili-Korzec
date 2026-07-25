import { createPoolFromEnv } from "./db.js";
import { migrateDown, migrateUp } from "./migrations.js";

const direction = process.argv[2] || "up";
const pool = createPoolFromEnv();

try {
  if (direction === "up") {
    await migrateUp(pool);
  } else if (direction === "down") {
    await migrateDown(pool);
  } else {
    throw new Error(`unknown migration direction: ${direction}`);
  }
} finally {
  await pool.end();
}

