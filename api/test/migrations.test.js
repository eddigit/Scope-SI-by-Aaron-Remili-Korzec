import assert from "node:assert/strict";
import test from "node:test";

import { listMigrations, migrationIdFromUpFile } from "../src/migrations.js";

test("migrationIdFromUpFile ignores macOS AppleDouble metadata files", () => {
  assert.equal(migrationIdFromUpFile("._001_core.up.sql"), null);
});

test("migrationIdFromUpFile accepts numbered up migrations", () => {
  assert.equal(migrationIdFromUpFile("001_core.up.sql"), "001_core");
});

test("listMigrations includes tenant and access schema", async () => {
  assert.deepEqual(await listMigrations(), [
    "001_core",
    "002_tenants_access",
  ]);
});
