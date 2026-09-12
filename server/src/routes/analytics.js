import { Router } from "express";
import { asyncRoute, queryFilters } from "./utils.js";
import { getDepartmentInsights, getSnapshot } from "../services/workforce.js";

const router = Router();
router.get("/dashboard", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json({ data: { ...snapshot.summary, gaps: snapshot.gaps, skills: snapshot.skills.slice(0, 8), successionRisks: snapshot.successionRisks.slice(0, 5) } }); }));
router.get("/insights", asyncRoute(async (req, res) => { const query = queryFilters(req); const snapshot = await getSnapshot(query); res.json({ data: { summary: snapshot.summary, coverage: await getDepartmentInsights(query), composition: snapshot.departments.map((department) => ({ label: department.name, count: snapshot.employees.filter((employee) => employee.departmentId === department.id).length })), trending: snapshot.skills.slice().sort((a, b) => b.prof - a.prof).slice(0, 5) } }); }));
router.get("/skills-heatmap", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json({ data: snapshot.skills }); }));
router.get("/skill-gaps", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json({ data: snapshot.gaps }); }));
router.get("/role-readiness", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json({ data: snapshot.roles.map((role) => ({ role, employees: snapshot.employees.filter((employee) => employee.roleId === role.id).length })) }); }));
router.get("/scenario-gaps", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json({ data: snapshot.gaps }); }));
router.get("/ai-readiness", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json({ data: snapshot.useCases.map((useCase) => ({ id: useCase.id, name: useCase.name, requirements: useCase.requirements })) }); }));
router.get("/succession", asyncRoute(async (req, res) => { const snapshot = await getSnapshot(queryFilters(req)); res.json({ data: snapshot.successionRisks }); }));
export default router;
