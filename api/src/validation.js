import { InputError } from "./errors.js";

const CLASS_CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,31}$/;
const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,79}$/;
const ROLES = new Set(["student", "teacher", "admin"]);

function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InputError("JSON object expected");
  }
  return value;
}

function optionalText(value, field, maxLength = 120) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new InputError(`${field} must be text`);
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new InputError(`${field} is too long`);
  return trimmed || null;
}

function requiredText(value, field, minLength, maxLength) {
  if (typeof value !== "string") throw new InputError(`${field} must be text`);
  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) {
    throw new InputError(`${field} length is invalid`);
  }
  return trimmed;
}

function optionalSafeId(value, field) {
  const id = optionalText(value, field, 80);
  if (id === null) return null;
  if (!SAFE_ID_PATTERN.test(id)) throw new InputError(`${field} format is invalid`);
  return id;
}

function requiredSafeId(value, field) {
  const id = requiredText(value, field, 2, 80);
  if (!SAFE_ID_PATTERN.test(id)) throw new InputError(`${field} format is invalid`);
  return id;
}

function requiredEmail(value) {
  const email = requiredText(value, "email", 5, 254).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new InputError("email format is invalid");
  }
  return email;
}

function optionalEmail(value) {
  if (value === undefined || value === null || value === "") return null;
  return requiredEmail(value);
}

function optionalInteger(value, field, defaultValue, min, max) {
  if (value === undefined || value === null) return defaultValue;
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new InputError(`${field} is invalid`);
  }
  return value;
}

export function parseClassCode(value) {
  const code = requiredText(value, "class code", 3, 32).toUpperCase();
  if (!CLASS_CODE_PATTERN.test(code)) {
    throw new InputError("class code format is invalid");
  }
  return code;
}

export function parseClassInput(body) {
  const input = requireObject(body);
  const parsed = {
    code: parseClassCode(input.code),
    label: optionalText(input.label, "label"),
  };
  const organizationId = optionalSafeId(input.organizationId, "organizationId");
  const schoolId = optionalSafeId(input.schoolId, "schoolId");
  if (organizationId) parsed.organizationId = organizationId;
  if (schoolId) parsed.schoolId = schoolId;
  return parsed;
}

export function parseUserInput(body) {
  const input = requireObject(body);
  const role = requiredText(input.role, "role", 3, 20);
  if (!ROLES.has(role)) throw new InputError("role is invalid");
  const parsed = {
    pseudo: requiredText(input.pseudo, "pseudo", 2, 40),
    classCode: parseClassCode(input.classCode),
    role,
  };
  const organizationId = optionalSafeId(input.organizationId, "organizationId");
  const schoolId = optionalSafeId(input.schoolId, "schoolId");
  if (organizationId) parsed.organizationId = organizationId;
  if (schoolId) parsed.schoolId = schoolId;
  return parsed;
}

function parseIdArray(value, field) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new InputError(`${field} must be an array`);
  const ids = value.map((item) => requiredText(item, field, 1, 80));
  if (ids.some((item) => !SAFE_ID_PATTERN.test(item))) {
    throw new InputError(`${field} contains an invalid id`);
  }
  return [...new Set(ids)];
}

function parseScores(value) {
  if (value === undefined) return {};
  const input = requireObject(value);
  const scores = {};
  for (const [activityId, score] of Object.entries(input)) {
    if (!SAFE_ID_PATTERN.test(activityId)) {
      throw new InputError("scores contains an invalid activity id");
    }
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      throw new InputError("score must be an integer between 0 and 100");
    }
    scores[activityId] = score;
  }
  return scores;
}

export function parseProgressInput(body) {
  const input = requireObject(body);
  const moduleId = requiredText(input.moduleId, "moduleId", 2, 80);
  if (!SAFE_ID_PATTERN.test(moduleId)) throw new InputError("moduleId format is invalid");
  return {
    moduleId,
    fichesRead: parseIdArray(input.fichesRead, "fichesRead"),
    activitesCompleted: parseIdArray(input.activitesCompleted, "activitesCompleted"),
    scores: parseScores(input.scores),
  };
}

export function parseLocalProgressImportInput(body) {
  const input = requireObject(body);
  if (input.source !== "localStorage") throw new InputError("source is invalid");
  if (input.optIn !== true) throw new InputError("optIn is required");
  const modules = requireObject(input.modules);
  const parsedModules = {};
  for (const [moduleId, progress] of Object.entries(modules)) {
    parsedModules[moduleId] = parseProgressInput({ ...progress, moduleId });
  }
  return {
    source: "localStorage",
    optIn: true,
    modules: parsedModules,
  };
}

export function parseTeacherInvitationInput(body) {
  const input = requireObject(body);
  const role = requiredText(input.role, "role", 3, 20);
  if (!new Set(["teacher", "admin"]).has(role)) throw new InputError("role is invalid");
  return {
    schoolId: requiredSafeId(input.schoolId, "schoolId"),
    email: optionalEmail(input.email),
    role,
    expiresInDays: optionalInteger(input.expiresInDays, "expiresInDays", 7, 1, 30),
  };
}

export function parseTeacherSessionInput(body) {
  const input = requireObject(body);
  return {
    invitationToken: requiredText(input.invitationToken, "invitationToken", 24, 240),
    pseudo: requiredText(input.pseudo, "pseudo", 2, 40),
  };
}
