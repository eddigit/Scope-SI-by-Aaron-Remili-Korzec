import { NextRequest, NextResponse } from "next/server";
import {
  buildInvitationLink,
  internalApiUrl,
  publicApiBase,
  publicAppBase,
} from "@/lib/infoscope-api-proxy.js";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const JSON_HEADERS = { "content-type": "application/json" };

async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function callBackend(path: string, init: RequestInit = {}) {
  const response = await fetch(internalApiUrl(publicApiBase(), path), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: JSON_HEADERS,
  });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const path = (await context.params).path.join("/");

  const classSummary = path.match(/^classes\/([^/]+)\/summary$/);
  if (classSummary) {
    return callBackend(`/api/public/classes/${encodeURIComponent(classSummary[1])}/summary`);
  }

  if (path === "analytics/overview") {
    return callBackend("/api/internal/analytics/overview");
  }

  return NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const path = (await context.params).path.join("/");
  const body = await readJson(request);

  if (path === "student/start") {
    return callBackend("/api/public/students", {
      method: "POST",
      body: JSON.stringify({
        pseudo: body.pseudo || "Explorateur",
        classCode: body.classCode,
        role: "student",
      }),
    });
  }

  const progressImport = path.match(/^users\/([^/]+)\/progress\/import$/);
  if (progressImport) {
    return callBackend(`/api/public/users/${encodeURIComponent(progressImport[1])}/progress/import`, {
      method: "POST",
      body: JSON.stringify({
        source: "localStorage",
        optIn: body.optIn === true,
        modules: body.modules || {},
      }),
    });
  }

  const classExport = path.match(/^classes\/([^/]+)\/export$/);
  if (classExport) {
    return callBackend(`/api/public/classes/${encodeURIComponent(classExport[1])}/export`, {
      method: "POST",
      body: JSON.stringify({ adminCode: body.adminCode }),
    });
  }

  const userDelete = path.match(/^users\/([^/]+)\/delete$/);
  if (userDelete) {
    return callBackend(`/api/public/users/${encodeURIComponent(userDelete[1])}/delete`, {
      method: "POST",
      body: JSON.stringify({ adminCode: body.adminCode }),
    });
  }

  if (path === "retention/purge-expired-access") {
    return callBackend("/api/public/retention/purge-expired-access", {
      method: "POST",
      body: JSON.stringify({ adminCode: body.adminCode }),
    });
  }

  if (path === "teacher/invitations") {
    const response = await callBackend("/api/public/teacher-invitations", {
      method: "POST",
      body: JSON.stringify({
        adminCode: body.adminCode,
        schoolId: body.schoolId || "default",
        email: body.email || null,
        role: body.role || "teacher",
        expiresInDays: body.expiresInDays || 7,
      }),
    });
    if (!response.ok) return response;
    const invitation = await response.json();
    return NextResponse.json({
      ...invitation,
      invitationLink: buildInvitationLink(publicAppBase(), invitation.invitationToken),
    });
  }

  if (path === "teacher/sessions") {
    return callBackend("/api/public/teacher-sessions", {
      method: "POST",
      body: JSON.stringify({
        invitationToken: body.invitationToken,
        pseudo: body.pseudo || "Enseignant",
      }),
    });
  }

  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
