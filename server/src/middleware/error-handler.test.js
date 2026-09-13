import test from "node:test";
import assert from "node:assert/strict";
import errorHandler from "./error-handler.js";

test("skill deletion reports development references after Express restores baseUrl", (t) => {
  t.mock.method(console, "error", () => {});
  const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  errorHandler({ cause: { code: "23503" } }, { method: "DELETE", baseUrl: "", originalUrl: "/api/v1/skills/s6" }, response, () => {});
  assert.equal(response.code, 409);
  assert.match(response.body.error, /development plans/);
});
