export const organizationSections = {
  roles: { label: "Roles", singular: "role", description: "Define job families, role levels, and the skills each role requires." },
  departments: { label: "Departments", singular: "department", description: "Maintain departments used to organize employees and teams." },
  teams: { label: "Teams", singular: "team", description: "Group employees into teams and assign each team to a department." },
  facilities: { label: "Facilities", singular: "facility", description: "Maintain workplaces and their locations." },
} as const;
export type OrganizationSection = keyof typeof organizationSections;
export type OrganizationRecord = { id: string; name: string; jobFamily?: string; level?: string; departmentId?: string | null; location?: string | null };
export function organizationSection(value: string | null): OrganizationSection {
  return value && Object.hasOwn(organizationSections, value) ? value as OrganizationSection : "roles";
}
