import test from "node:test";
import assert from "node:assert/strict";
import { knowledgeApiBase } from "../app/lib/knowledge-api-base.ts";
import { apiUrl } from "../app/lib/api-url.ts";

const path = "/api/v1/knowledge/sources/github";

test("local Knowledge Transfer requests use the Vite proxy, not the hosted workforce API", () => {
  const base = knowledgeApiBase({ development: true, fallback: "https://workforce.example/api" });
  assert.equal(apiUrl(base, path), path);
});

test("production Knowledge Transfer requests retain the configured API without duplicate prefixes", () => {
  const base = knowledgeApiBase({ development: false, fallback: "https://workforce.example/api/" });
  assert.equal(apiUrl(base, path), "https://workforce.example/api/v1/knowledge/sources/github");
});

test("an explicit Knowledge Transfer API overrides both local and production defaults", () => {
  for (const development of [true, false]) {
    const base = knowledgeApiBase({ development, override: " https://knowledge.example/api ", fallback: "https://workforce.example" });
    assert.equal(apiUrl(base, path), "https://knowledge.example/api/v1/knowledge/sources/github");
  }
  assert.equal(knowledgeApiBase({ development: true, override: " " }), "");
  assert.equal(knowledgeApiBase({ development: false }), "http://localhost:3001");
});
