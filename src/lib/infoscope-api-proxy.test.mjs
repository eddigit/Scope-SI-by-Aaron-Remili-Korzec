import assert from "node:assert/strict";
import test from "node:test";

import {
  assertAdminCode,
  buildInvitationLink,
  internalApiUrl,
  publicApiBase,
} from "./infoscope-api-proxy.js";

test("internalApiUrl builds safe API URLs without exposing secrets", () => {
  assert.equal(
    internalApiUrl("https://api.infosscope.com", "/api/internal/users").toString(),
    "https://api.infosscope.com/api/internal/users",
  );
});

test("publicApiBase defaults to api.infosscope.com", () => {
  assert.equal(publicApiBase({}), "https://api.infosscope.com");
});

test("assertAdminCode requires server-side configured code", () => {
  assert.throws(() => assertAdminCode("abc", {}), /disabled/);
  assert.throws(() => assertAdminCode("wrong", { INFOSCOPE_ADMIN_SETUP_CODE: "right" }), /invalid/);
  assert.doesNotThrow(() => assertAdminCode("right", { INFOSCOPE_ADMIN_SETUP_CODE: "right" }));
});

test("buildInvitationLink generates copyable app URL from token", () => {
  assert.equal(
    buildInvitationLink("https://app.infosscope.com", "teacher-token"),
    "https://app.infosscope.com/enseignant?invite=teacher-token",
  );
});
