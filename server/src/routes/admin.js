import { Router } from "express";

const router = Router();

router.get("/schema", (req, res) => {
  res.json({ data: [
    { name: "departments", fields: ["id", "name"] },
    { name: "employees", fields: ["id", "name", "title", "department_id", "role_id", "manager_id"] },
    { name: "roles", fields: ["id", "name", "job_family", "level"] },
    { name: "skills", fields: ["id", "name", "category"] },
    { name: "employee_skills", fields: ["employee_id", "skill_id", "proficiency", "years_experience", "verified"] },
    { name: "role_skill_requirements", fields: ["role_id", "skill_id", "required_level", "importance"] },
  ] });
});

export default router;
