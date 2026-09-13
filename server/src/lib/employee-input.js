import { z } from "zod";

const optionalId = z.string().trim().min(1).nullable().optional();
const optionalDate = z.iso.date().nullable().optional();

const fields = z.object({
  name: z.string().trim().min(1, "Enter the employee's name.").max(200),
  title: z.string().trim().min(1, "Enter a job title.").max(200),
  email: z.string().trim().email("Enter a valid email address.").nullable().optional(),
  teamId: optionalId,
  roleId: optionalId,
  managerId: optionalId,
  departmentId: optionalId,
  facilityId: optionalId,
  hireDate: optionalDate,
  retirementDate: optionalDate,
  employmentStatus: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE", "RETIRED", "TERMINATED"]),
});

function validDates(employee) {
  return !employee.hireDate || !employee.retirementDate || employee.retirementDate >= employee.hireDate;
}
const dateError = { message: "Retirement date must be on or after hire date.", path: ["retirementDate"] };

export const createEmployeeInput = fields.extend({ employmentStatus: fields.shape.employmentStatus.default("ACTIVE") }).refine(validDates, dateError);
export const updateEmployeeInput = fields.partial().refine(validDates, dateError);
