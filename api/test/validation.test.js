import assert from "node:assert/strict";
import test from "node:test";

import {
  parseClassInput,
  parseProgressInput,
  parseUserInput,
} from "../src/validation.js";

test("parseUserInput accepts a trimmed pseudo, class code, and known role", () => {
  assert.deepEqual(parseUserInput({
    pseudo: "  Aaron  ",
    classCode: "FREINET-6A",
    role: "student",
  }), {
    pseudo: "Aaron",
    classCode: "FREINET-6A",
    role: "student",
  });
});

test("parseUserInput rejects unknown roles", () => {
  assert.throws(() => parseUserInput({
    pseudo: "Aaron",
    classCode: "FREINET-6A",
    role: "admin",
  }), /role/);
});

test("parseClassInput rejects unsafe class codes", () => {
  assert.throws(() => parseClassInput({ code: "freinet 6a" }), /class code/);
});

test("parseProgressInput accepts minimal module progress payloads", () => {
  assert.deepEqual(parseProgressInput({
    moduleId: "opinion-vs-fait",
    fichesRead: ["quest-ce-quun-fait"],
    activitesCompleted: ["quiz-fait-ou-opinion"],
    scores: { "quiz-fait-ou-opinion": 8 },
  }), {
    moduleId: "opinion-vs-fait",
    fichesRead: ["quest-ce-quun-fait"],
    activitesCompleted: ["quiz-fait-ou-opinion"],
    scores: { "quiz-fait-ou-opinion": 8 },
  });
});

