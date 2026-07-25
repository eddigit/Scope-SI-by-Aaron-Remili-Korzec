export function publicApiBase(env = process.env) {
  return env.INFOSCOPE_API_BASE_URL || "https://api.infosscope.com";
}

export function publicAppBase(env = process.env) {
  return env.NEXT_PUBLIC_APP_BASE_URL || "https://app.infosscope.com";
}

export function internalApiUrl(baseUrl, path) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, normalizedBase);
}

export function assertAdminCode(inputCode, env = process.env) {
  const configured = env.INFOSCOPE_ADMIN_SETUP_CODE;
  if (!configured) throw new Error("teacher invitation setup is disabled");
  if (inputCode !== configured) throw new Error("admin setup code is invalid");
}

export function buildInvitationLink(appBaseUrl, invitationToken) {
  const url = new URL("/enseignant", appBaseUrl);
  url.searchParams.set("invite", invitationToken);
  return url.toString();
}
