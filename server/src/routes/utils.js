import { randomUUID } from "node:crypto";
import { z } from "zod";

export const listQuery = z.object({
  departmentId: z.string().optional(),
  facilityId: z.string().optional(),
  teamId: z.string().optional(),
  roleId: z.string().optional(),
  scenarioId: z.string().optional(),
  skillId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export function queryFilters(req) {
  return listQuery.parse(req.query);
}

export function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function paginate(rows, page = 1, limit = 25) {
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const start = (safePage - 1) * safeLimit;
  return { data: rows.slice(start, start + safeLimit), meta: { page: safePage, limit: safeLimit, total: rows.length } };
}

export function resourceId() {
  return randomUUID();
}
