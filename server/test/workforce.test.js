import test from "node:test";
import assert from "node:assert/strict";
import { paginate } from "../src/services/workforce.js";

test("paginate returns bounded page metadata", () => {
  const result = paginate([1, 2, 3, 4], 2, 2);
  assert.deepEqual(result, {
    data: [3, 4],
    meta: { page: 2, limit: 2, total: 4 },
  });
});

test("paginate clamps invalid limits", () => {
  const result = paginate([1, 2], 0, 500);
  assert.deepEqual(result.meta, { page: 1, limit: 100, total: 2 });
});
