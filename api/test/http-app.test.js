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

test("CORS allows only configured origins and handles preflight", async () => {
  const app = createApp({
    allowedOrigins: ["https://app.infosscope.com"],
    db: {
      health: async () => ({ ok: true, migrations: 1 }),
    },
  });

  const allowed = await request(app, "OPTIONS", "/api/internal/users", undefined, {
    origin: "https://app.infosscope.com",
    "access-control-request-method": "POST",
  });
  assert.equal(allowed.statusCode, 204);
  assert.equal(allowed.headers["access-control-allow-origin"], "https://app.infosscope.com");
  assert.match(allowed.headers["access-control-allow-headers"], /x-infoscope-internal-key/);

  const denied = await request(app, "OPTIONS", "/api/internal/users", undefined, {
    origin: "https://evil.example",
    "access-control-request-method": "POST",
  });
  assert.equal(denied.statusCode, 403);
  assert.equal(denied.headers["access-control-allow-origin"], undefined);
});

test("responses include CORS headers only for allowed origins", async () => {
  const app = createApp({
    internalApiKey: "secret-key",
    allowedOrigins: ["https://app.infosscope.com"],
    db: {
      health: async () => ({ ok: true, migrations: 1 }),
    },
  });

  const response = await request(app, "GET", "/api/health", undefined, {
    origin: "https://app.infosscope.com",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["access-control-allow-origin"], "https://app.infosscope.com");
  assert.equal(response.headers.vary, "Origin");

  const unauthorized = await request(app, "POST", "/api/internal/users", {}, {
    origin: "https://app.infosscope.com",
  });
  assert.equal(unauthorized.statusCode, 401);
  assert.equal(unauthorized.headers["access-control-allow-origin"], "https://app.infosscope.com");
});

test("rate limiting rejects repeated internal requests from the same client", async () => {
  const app = createApp({
    internalApiKey: "secret-key",
    rateLimit: { windowMs: 60_000, maxRequests: 1 },
    db: {
      createClass: async () => ({ code: "FREINET-6A", label: null }),
    },
  });

  const first = await request(app, "POST", "/api/internal/classes", { code: "FREINET-6A" }, {
    "x-infoscope-internal-key": "secret-key",
    "x-forwarded-for": "203.0.113.10",
  });
  assert.equal(first.statusCode, 201);

  const second = await request(app, "POST", "/api/internal/classes", { code: "FREINET-6A" }, {
    "x-infoscope-internal-key": "secret-key",
    "x-forwarded-for": "203.0.113.10",
  });
  assert.equal(second.statusCode, 429);
  assert.deepEqual(JSON.parse(second.body), { error: "rate_limited" });
});
