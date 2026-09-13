import test from "node:test";
import assert from "node:assert/strict";
import { createEmployeeInput, updateEmployeeInput } from "../src/lib/employee-input.js";

test("employee updates preserve organizational assignments and dates", () => {
  const changes = { teamId: "t1", managerId: "e2", hireDate: "2024-02-29", retirementDate: "2040-01-01" };
  assert.deepEqual(updateEmployeeInput.parse(changes), changes);
});

test("optional employee values can be cleared", () => {
  const cleared = { email: null, teamId: null, managerId: null, roleId: null, departmentId: null, facilityId: null, hireDate: null, retirementDate: null };
  assert.deepEqual(updateEmployeeInput.parse(cleared), cleared);
});

test("employee forms reject invalid identity, status, and date order", () => {
  const base = { name: "Test Employee", title: "Engineer" };
  for (const changes of [{ name: "  " }, { title: "" }, { email: "invalid" }, { employmentStatus: "UNKNOWN" }, { hireDate: "2025-02-29" }, { hireDate: "2025-01-01", retirementDate: "2024-01-01" }]) {
    assert.equal(createEmployeeInput.safeParse({ ...base, ...changes }).success, false);
  }
  assert.equal(createEmployeeInput.parse(base).employmentStatus, "ACTIVE");
});
