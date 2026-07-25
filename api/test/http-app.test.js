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

test("POST /api/internal/classes accepts tenant and school context", async () => {
  const calls = [];
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      createClass: async (input) => {
        calls.push(input);
        return { code: input.code, label: input.label, organizationId: input.organizationId, schoolId: input.schoolId };
      },
    },
  });

  const response = await request(app, "POST", "/api/internal/classes", {
    code: "FREINET-6A",
    label: "6e A",
    organizationId: "org-freinet",
    schoolId: "college-freinet",
  }, {
    "x-infoscope-internal-key": "secret-key",
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(calls, [{
    code: "FREINET-6A",
    label: "6e A",
    organizationId: "org-freinet",
    schoolId: "college-freinet",
  }]);
  assert.deepEqual(JSON.parse(response.body), {
    code: "FREINET-6A",
    label: "6e A",
    organizationId: "org-freinet",
    schoolId: "college-freinet",
  });
});

test("POST /api/internal/users accepts admin role and school context", async () => {
  const calls = [];
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      createUser: async (input) => {
        calls.push(input);
        return { id: "user-admin", ...input };
      },
    },
  });

  const response = await request(app, "POST", "/api/internal/users", {
    pseudo: "Admin pilote",
    classCode: "FREINET-6A",
    role: "admin",
    organizationId: "org-freinet",
    schoolId: "college-freinet",
  }, {
    "x-infoscope-internal-key": "secret-key",
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(calls, [{
    pseudo: "Admin pilote",
    classCode: "FREINET-6A",
    role: "admin",
    organizationId: "org-freinet",
    schoolId: "college-freinet",
  }]);
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

test("rate limiting can be configured from environment", async () => {
  const app = createApp({
    internalApiKey: "secret-key",
    env: {
      INFOSCOPE_RATE_LIMIT_WINDOW_MS: "60000",
      INFOSCOPE_RATE_LIMIT_MAX_REQUESTS: "1",
    },
    db: {
      createClass: async () => ({ code: "FREINET-6A", label: null }),
    },
  });

  const headers = {
    "x-infoscope-internal-key": "secret-key",
    "x-forwarded-for": "203.0.113.11",
  };

  assert.equal((await request(app, "POST", "/api/internal/classes", { code: "FREINET-6A" }, headers)).statusCode, 201);
  assert.equal((await request(app, "POST", "/api/internal/classes", { code: "FREINET-6A" }, headers)).statusCode, 429);
});

test("teacher invitations return a one-time token without storing it in plain text", async () => {
  const calls = [];
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      createTeacherInvitation: async (input) => {
        calls.push(input);
        return {
          id: "invite-1",
          schoolId: input.schoolId,
          role: input.role,
          expiresAt: "2026-08-01T00:00:00.000Z",
          invitationToken: "one-time-token",
        };
      },
    },
  });

  const response = await request(app, "POST", "/api/internal/teacher-invitations", {
    schoolId: "college-freinet",
    email: " prof@example.com ",
    role: "teacher",
    expiresInDays: 7,
  }, {
    "x-infoscope-internal-key": "secret-key",
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(calls, [{
    schoolId: "college-freinet",
    email: "prof@example.com",
    role: "teacher",
    expiresInDays: 7,
  }]);
  assert.deepEqual(JSON.parse(response.body), {
    id: "invite-1",
    schoolId: "college-freinet",
    role: "teacher",
    expiresAt: "2026-08-01T00:00:00.000Z",
    invitationToken: "one-time-token",
  });
});

test("teacher session creation accepts an invitation token and returns a server session", async () => {
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      acceptTeacherInvitation: async (input) => ({
        user: {
          id: "teacher-1",
          pseudo: input.pseudo,
          role: "teacher",
          organizationId: "org-freinet",
          schoolId: "college-freinet",
        },
        session: {
          id: "session-1",
          expiresAt: "2026-08-01T00:00:00.000Z",
        },
      }),
    },
  });

  const response = await request(app, "POST", "/api/internal/teacher-sessions", {
    invitationToken: "one-time-token-with-enough-entropy",
    pseudo: "Prof Freinet",
  }, {
    "x-infoscope-internal-key": "secret-key",
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(JSON.parse(response.body), {
    user: {
      id: "teacher-1",
      pseudo: "Prof Freinet",
      role: "teacher",
      organizationId: "org-freinet",
      schoolId: "college-freinet",
    },
    session: {
      id: "session-1",
      expiresAt: "2026-08-01T00:00:00.000Z",
    },
  });
});

test("localStorage progress import is explicit and non destructive", async () => {
  const calls = [];
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      importLocalProgress: async (userId, input) => {
        calls.push({ userId, input });
        return { importedModules: ["opinion-vs-fait"], skippedModules: [] };
      },
    },
  });

  const response = await request(app, "POST", "/api/internal/users/user-1/progress/import", {
    source: "localStorage",
    optIn: true,
    modules: {
      "opinion-vs-fait": {
        fichesRead: ["quest-ce-quun-fait"],
        activitesCompleted: ["quiz-fait-ou-opinion"],
        scores: { "quiz-fait-ou-opinion": 80 },
      },
    },
  }, {
    "x-infoscope-internal-key": "secret-key",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(calls, [{
    userId: "user-1",
    input: {
      source: "localStorage",
      optIn: true,
      modules: {
        "opinion-vs-fait": {
          moduleId: "opinion-vs-fait",
          fichesRead: ["quest-ce-quun-fait"],
          activitesCompleted: ["quiz-fait-ou-opinion"],
          scores: { "quiz-fait-ou-opinion": 80 },
        },
      },
    },
  }]);
  assert.deepEqual(JSON.parse(response.body), {
    importedModules: ["opinion-vs-fait"],
    skippedModules: [],
  });
});

test("localStorage progress import rejects missing opt-in", async () => {
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      importLocalProgress: async () => {
        throw new Error("should not import without opt-in");
      },
    },
  });

  const response = await request(app, "POST", "/api/internal/users/user-1/progress/import", {
    source: "localStorage",
    modules: {},
  }, {
    "x-infoscope-internal-key": "secret-key",
  });

  assert.equal(response.statusCode, 400);
});

test("class summary returns teacher-safe aggregate progress only", async () => {
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      getClassSummary: async (classCode) => ({
        classCode,
        studentCount: 2,
        modules: [
          { moduleId: "opinion-vs-fait", startedCount: 2, completedActivityCount: 3 },
        ],
      }),
    },
  });

  const response = await request(app, "GET", "/api/internal/classes/FREINET-6A/summary", undefined, {
    "x-infoscope-internal-key": "secret-key",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    classCode: "FREINET-6A",
    studentCount: 2,
    modules: [
      { moduleId: "opinion-vs-fait", startedCount: 2, completedActivityCount: 3 },
    ],
  });
});

test("analytics overview is aggregate and non identifying", async () => {
  const app = createApp({
    internalApiKey: "secret-key",
    db: {
      getAnalyticsOverview: async () => ({
        organizations: 1,
        schools: 1,
        classes: 2,
        studentUsers: 40,
        teacherUsers: 3,
        progressRows: 120,
      }),
    },
  });

  const response = await request(app, "GET", "/api/internal/analytics/overview", undefined, {
    "x-infoscope-internal-key": "secret-key",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    organizations: 1,
    schools: 1,
    classes: 2,
    studentUsers: 40,
    teacherUsers: 3,
    progressRows: 120,
  });
});
