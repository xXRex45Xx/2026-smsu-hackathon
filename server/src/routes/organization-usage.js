import { count, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { employees, teams, developmentPlans, roleSkillRequirements } from "../db/schema.js";
import { asyncRoute } from "./utils.js";

const references = {
  departments: { employees: [employees, employees.departmentId], teams: [teams, teams.departmentId] },
  facilities: { employees: [employees, employees.facilityId] },
  teams: { employees: [employees, employees.teamId] },
  roles: { employees: [employees, employees.roleId], developmentPlans: [developmentPlans, developmentPlans.targetRoleId], requirements: [roleSkillRequirements, roleSkillRequirements.roleId] },
};

export function organizationUsage(kind, table, parameter) {
  return asyncRoute(async (req, res) => {
    const id = req.params[parameter];
    const [record] = await db.select({ id: table.id }).from(table).where(eq(table.id, id));
    if (!record) return res.status(404).json({ error: "Organization record not found" });
    const counts = await Promise.all(Object.entries(references[kind]).map(async ([key, [source, column]]) => {
      const [row] = await db.select({ value: count() }).from(source).where(eq(column, id));
      return [key, row.value];
    }));
    res.json({ data: Object.fromEntries(counts) });
  });
}
