import { createServer } from "node:http";

import { InputError, UnauthorizedError } from "./errors.js";
import {
  parseClassInput,
  parseClassCode,
  parseLocalProgressImportInput,
  parseProgressInput,
  parseTeacherInvitationInput,
  parseTeacherSessionInput,
  parseUserInput,
} from "./validation.js";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const DEFAULT_RATE_LIMIT = { windowMs: 60_000, maxRequests: 120 };

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new InputError("invalid JSON body");
  }
}

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, { ...JSON_HEADERS, ...headers });
  res.end(JSON.stringify(body));
}

function sendEmpty(res, statusCode, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end();
}

function requireInternalKey(req, internalApiKey) {
  if (!internalApiKey) return;
  if (req.headers["x-infoscope-internal-key"] !== internalApiKey) {
    throw new UnauthorizedError();
  }
}

function routePath(url) {
  return new URL(url, "http://internal").pathname;
}

function corsHeaders(req, allowedOrigins) {
  const origin = req.headers.origin;
  if (!origin || !allowedOrigins.includes(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
    "access-control-allow-headers": "content-type,x-infoscope-internal-key",
    "vary": "Origin",
  };
}

function clientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "local";
}

function createRateLimiter({ windowMs, maxRequests } = DEFAULT_RATE_LIMIT) {
  const buckets = new Map();
  return function checkRateLimit(req) {
    const now = Date.now();
    const key = clientKey(req);
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true };
    }
    current.count += 1;
    if (current.count > maxRequests) {
      return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
    }
    return { allowed: true };
  };
}

function rateLimitFromEnv(env) {
  return {
    windowMs: Number(env.INFOSCOPE_RATE_LIMIT_WINDOW_MS || DEFAULT_RATE_LIMIT.windowMs),
    maxRequests: Number(env.INFOSCOPE_RATE_LIMIT_MAX_REQUESTS || DEFAULT_RATE_LIMIT.maxRequests),
  };
}

export function createApp({
  db,
  env = process.env,
  internalApiKey = env.INFOSCOPE_INTERNAL_API_KEY,
  allowedOrigins = (env.INFOSCOPE_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  rateLimit = rateLimitFromEnv(env),
} = {}) {
  if (!db) throw new Error("db adapter is required");
  const checkRateLimit = createRateLimiter(rateLimit);

  async function handler(req, res) {
    let cors = {};
    try {
      const path = routePath(req.url);
      cors = corsHeaders(req, allowedOrigins);

      if (req.method === "OPTIONS") {
        if (!req.headers.origin || Object.keys(cors).length === 0) {
          send(res, 403, { error: "origin_not_allowed" });
          return;
        }
        sendEmpty(res, 204, cors);
        return;
      }

      if (req.method === "GET" && path === "/api/health") {
        const health = await db.health();
        send(res, health.ok ? 200 : 503, {
          status: health.ok ? "ok" : "degraded",
          database: health.ok ? "ok" : "unavailable",
          migrations: health.migrations ?? 0,
        }, cors);
        return;
      }

      if (path.startsWith("/api/internal/")) {
        const rate = checkRateLimit(req);
        if (!rate.allowed) {
          send(res, 429, { error: "rate_limited" }, {
            ...cors,
            "retry-after": String(rate.retryAfter),
          });
          return;
        }
        requireInternalKey(req, internalApiKey);
      }

      if (req.method === "POST" && path === "/api/internal/classes") {
        send(res, 201, await db.createClass(parseClassInput(await readJson(req))), cors);
        return;
      }

      const classSummaryMatch = path.match(/^\/api\/internal\/classes\/([^/]+)\/summary$/);
      if (req.method === "GET" && classSummaryMatch) {
        send(res, 200, await db.getClassSummary(parseClassCode(classSummaryMatch[1])), cors);
        return;
      }

      if (req.method === "GET" && path === "/api/internal/analytics/overview") {
        send(res, 200, await db.getAnalyticsOverview(), cors);
        return;
      }

      if (req.method === "POST" && path === "/api/internal/users") {
        send(res, 201, await db.createUser(parseUserInput(await readJson(req))), cors);
        return;
      }

      if (req.method === "POST" && path === "/api/internal/teacher-invitations") {
        send(res, 201, await db.createTeacherInvitation(parseTeacherInvitationInput(await readJson(req))), cors);
        return;
      }

      if (req.method === "POST" && path === "/api/internal/teacher-sessions") {
        send(res, 201, await db.acceptTeacherInvitation(parseTeacherSessionInput(await readJson(req))), cors);
        return;
      }

      const progressImportMatch = path.match(/^\/api\/internal\/users\/([^/]+)\/progress\/import$/);
      if (req.method === "POST" && progressImportMatch) {
        send(
          res,
          200,
          await db.importLocalProgress(
            progressImportMatch[1],
            parseLocalProgressImportInput(await readJson(req)),
          ),
          cors,
        );
        return;
      }

      const progressMatch = path.match(/^\/api\/internal\/users\/([^/]+)\/progress(?:\/([^/]+))?$/);
      if (req.method === "GET" && progressMatch && !progressMatch[2]) {
        send(res, 200, { progress: await db.getUserProgress(progressMatch[1]) }, cors);
        return;
      }

      if (req.method === "PUT" && progressMatch && progressMatch[2]) {
        const payload = parseProgressInput({ ...(await readJson(req)), moduleId: progressMatch[2] });
        send(res, 200, await db.upsertProgress(progressMatch[1], payload), cors);
        return;
      }

      send(res, 404, { error: "not_found" }, cors);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      send(res, statusCode, {
        error: statusCode >= 500 ? "internal_error" : error.message,
      }, cors);
    }
  }

  return {
    handler,
    listen: (...args) => createServer(handler).listen(...args),
    async inject({ method, path, headers = {}, body }) {
      const req = {
        method,
        url: path,
        headers,
        async *[Symbol.asyncIterator]() {
          if (body !== undefined) yield Buffer.from(body);
        },
      };
      let statusCode = 0;
      let responseBody = "";
      let responseHeaders = {};
      const res = {
        writeHead(code, headers = {}) {
          statusCode = code;
          responseHeaders = headers;
        },
        end(payload) {
          responseBody = payload ?? "";
        },
      };
      await handler(req, res);
      return { statusCode, headers: responseHeaders, body: responseBody };
    },
  };
}
