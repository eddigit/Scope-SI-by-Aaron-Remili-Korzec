import { createServer } from "node:http";

import { InputError, UnauthorizedError } from "./errors.js";
import { parseClassInput, parseProgressInput, parseUserInput } from "./validation.js";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

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

function send(res, statusCode, body) {
  res.writeHead(statusCode, JSON_HEADERS);
  res.end(JSON.stringify(body));
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

export function createApp({ db, internalApiKey = process.env.INFOSCOPE_INTERNAL_API_KEY } = {}) {
  if (!db) throw new Error("db adapter is required");

  async function handler(req, res) {
    try {
      const path = routePath(req.url);

      if (req.method === "GET" && path === "/api/health") {
        const health = await db.health();
        send(res, health.ok ? 200 : 503, {
          status: health.ok ? "ok" : "degraded",
          database: health.ok ? "ok" : "unavailable",
          migrations: health.migrations ?? 0,
        });
        return;
      }

      if (path.startsWith("/api/internal/")) {
        requireInternalKey(req, internalApiKey);
      }

      if (req.method === "POST" && path === "/api/internal/classes") {
        send(res, 201, await db.createClass(parseClassInput(await readJson(req))));
        return;
      }

      if (req.method === "POST" && path === "/api/internal/users") {
        send(res, 201, await db.createUser(parseUserInput(await readJson(req))));
        return;
      }

      const progressMatch = path.match(/^\/api\/internal\/users\/([^/]+)\/progress(?:\/([^/]+))?$/);
      if (req.method === "GET" && progressMatch && !progressMatch[2]) {
        send(res, 200, { progress: await db.getUserProgress(progressMatch[1]) });
        return;
      }

      if (req.method === "PUT" && progressMatch && progressMatch[2]) {
        const payload = parseProgressInput({ ...(await readJson(req)), moduleId: progressMatch[2] });
        send(res, 200, await db.upsertProgress(progressMatch[1], payload));
        return;
      }

      send(res, 404, { error: "not_found" });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      send(res, statusCode, {
        error: statusCode >= 500 ? "internal_error" : error.message,
      });
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
      const res = {
        writeHead(code) {
          statusCode = code;
        },
        end(payload) {
          responseBody = payload;
        },
      };
      await handler(req, res);
      return { statusCode, body: responseBody };
    },
  };
}

