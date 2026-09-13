import test from "node:test";
import assert from "node:assert/strict";
import { planInput, planUpdateInput, planItemInput, planItemUpdateInput } from "./development-input.js";

test("partial plan and item updates preserve omitted status", () => {
  assert.deepEqual(planUpdateInput.parse({title:"Updated"}),{title:"Updated"});
  assert.deepEqual(planItemUpdateInput.parse({type:"PROJECT"}),{type:"PROJECT"});
});
test("target roles can be cleared and required plan fields reject whitespace", () => {
  assert.deepEqual(planUpdateInput.parse({targetRoleId:null}),{targetRoleId:null});
  assert.equal(planInput.safeParse({employeeId:"e1",title:"  "}).success,false);
  assert.equal(planInput.safeParse({employeeId:"",title:"Plan"}).success,false);
});
test("plan items enforce proficiency scales and accept custom activity types", () => {
  const item={skillId:"s1",type:"WORKSHOP",currentLevel:1,targetLevel:5};
  assert.equal(planItemInput.parse(item).status,"PLANNED");
  for(const field of ["currentLevel","targetLevel"]) for(const invalid of [0,6,1.5]) assert.equal(planItemInput.safeParse({...item,[field]:invalid}).success,false);
  assert.equal(planItemInput.safeParse({...item,type:"  "}).success,false);
});
