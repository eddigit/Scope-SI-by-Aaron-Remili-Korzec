import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "migrations");

export async function ensureMigrationTable(pool) {
  await pool.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

export async function listMigrations() {
  const files = await readdir(MIGRATIONS_DIR);
  return files
    .map(migrationIdFromUpFile)
    .filter(Boolean)
    .sort();
}

export function migrationIdFromUpFile(file) {
  const match = file.match(/^(\d{3}_[a-z0-9_]+)\.up\.sql$/);
  return match ? match[1] : null;
}

export async function migrateUp(pool) {
  await ensureMigrationTable(pool);
  const applied = await appliedMigrations(pool);
  const migrations = await listMigrations();
  for (const id of migrations) {
    if (applied.has(id)) continue;
    const sql = await readFile(path.join(MIGRATIONS_DIR, `${id}.up.sql`), "utf8");
    await pool.query("begin");
    try {
      await pool.query(sql);
      await pool.query("insert into schema_migrations (id) values ($1)", [id]);
      await pool.query("commit");
    } catch (error) {
      await pool.query("rollback");
      throw error;
    }
  }
}

export async function migrateDown(pool) {
  await ensureMigrationTable(pool);
  const applied = [...(await appliedMigrations(pool))].sort().reverse();
  const id = applied[0];
  if (!id) return;
  const sql = await readFile(path.join(MIGRATIONS_DIR, `${id}.down.sql`), "utf8");
  await pool.query("begin");
  try {
    await pool.query(sql);
    await pool.query("delete from schema_migrations where id = $1", [id]);
    await pool.query("commit");
  } catch (error) {
    await pool.query("rollback");
    throw error;
  }
}

async function appliedMigrations(pool) {
  const result = await pool.query("select id from schema_migrations");
  return new Set(result.rows.map((row) => row.id));
}
