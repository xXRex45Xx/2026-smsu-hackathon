import test from "node:test";
import assert from "node:assert/strict";
import { departmentInput, facilityInput, teamInput, roleInput, roleRequirementInput } from "./organization-input.js";

test("organization names reject whitespace and role fields are required", () => {
  assert.equal(departmentInput.safeParse({name:"  "}).success,false);
  assert.equal(roleInput.safeParse({name:"Engineer",jobFamily:"",level:"Senior"}).success,false);
  assert.equal(roleInput.safeParse({name:"Engineer",jobFamily:"Engineering",level:"  "}).success,false);
  assert.deepEqual(departmentInput.parse({name:" Operations "}),{name:"Operations"});
});
test("optional organization assignments and locations can be cleared", () => {
  assert.deepEqual(teamInput.partial().parse({departmentId:null}),{departmentId:null});
  assert.deepEqual(facilityInput.partial().parse({location:null}),{location:null});
});
test("role requirements enforce both independent integer scales", () => {
  for (const field of ["requiredLevel","importance"]) {
    for (const invalid of [0,6,2.5]) assert.equal(roleRequirementInput.safeParse({requiredLevel:3,importance:3,[field]:invalid}).success,false);
  }
  assert.deepEqual(roleRequirementInput.parse({requiredLevel:1,importance:5}),{requiredLevel:1,importance:5});
});
