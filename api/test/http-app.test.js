import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "../src/http-app.js";

function request(app, method, path, body, headers = {}) {
  return app.inject({
    method,
    path,
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test("GET /api/health reports database and migration health", async () => {
  const app = createApp({
    db: {
      health: async () => ({ ok: true, migrations: 1 }),
    },
  });

  const response = await request(app, "GET", "/api/health");

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    status: "ok",
    database: "ok",
    migrations: 1,
  });
});

test("internal write endpoints require the configured internal key", async () => {
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      createClass: async () => ({}),
    },
  });

  const response = await request(app, "POST", "/api/internal/classes", {
    code: "FREINET-6A",
  });

  assert.equal(response.statusCode, 401);
});

test("POST /api/internal/users validates and persists a pseudo user", async () => {
  const calls = [];
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      createUser: async (input) => {
        calls.push(input);
        return { id: "user-1", ...input };
      },
    },
  });

  const response = await request(app, "POST", "/api/internal/users", {
    pseudo: "  Aaron  ",
    classCode: "FREINET-6A",
    role: "student",
  }, {
    "x-infoscope-internal-key": "secret-key",
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(calls, [{
    pseudo: "Aaron",
    classCode: "FREINET-6A",
    role: "student",
  }]);
  assert.deepEqual(JSON.parse(response.body), {
    id: "user-1",
    pseudo: "Aaron",
    classCode: "FREINET-6A",
    role: "student",
  });
});

