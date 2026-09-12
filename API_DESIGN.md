# SkillBridge API Design

## Design Rules

- Base path: `/api/v1`
- Resource routes use plural nouns.
- One route module owns one resource.
- Route handlers validate input, call services, and format responses.
- Services contain business logic.
- Repositories contain Drizzle queries.
- No SQL inside route handlers.
- Clerk middleware remains a future integration point.
- Pagination uses `page` and `limit`.
- Maximum `limit`: `100`.
- Dates use ISO 8601.
- IDs remain stable strings for seeded records.

## Proposed Backend Layout

```text
server/src/
  routes/
    index.js
    health.js
    employees.js
    skills.js
    roles.js
    departments.js
    facilities.js
    teams.js
    scenarios.js
    development-plans.js
    business-processes.js
    ai-use-cases.js
    courses.js
    reports.js
    notifications.js
    succession-risks.js
    analytics.js
  services/
    employees.js
    skills.js
    roles.js
    development-plans.js
    ai-use-cases.js
    analytics.js
  db/
    repositories/
```

Current `routes/workforce.js` combines resources for fast initial delivery. Split it into modules before adding more behavior.

## Response Format

Single resource:

```json
{
  "data": {
    "id": "e1"
  }
}
```

Collection:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 0
  }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

## Common Query Parameters

```text
page=1
limit=25
sort=name
order=asc
departmentId=d1
facilityId=f1
status=ACTIVE
search=cloud
```

Invalid parameters return `400`. Unknown resources return `404`.

## Health

### `GET /api/health`

Returns process and database status.

```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-09-12T00:00:00.000Z"
}
```

## Employees

Route module: `routes/employees.js`

```text
GET    /api/v1/employees
GET    /api/v1/employees/:employeeId
POST   /api/v1/employees
PATCH  /api/v1/employees/:employeeId
DELETE /api/v1/employees/:employeeId
GET    /api/v1/employees/:employeeId/skills
GET    /api/v1/employees/:employeeId/development-plans
```

Filters:

```text
departmentId
facilityId
teamId
roleId
employmentStatus
search
```

Create/update fields:

```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "title": "Software Engineer",
  "teamId": "t1",
  "roleId": "r1",
  "managerId": "e4",
  "departmentId": "d1",
  "facilityId": "f1",
  "hireDate": "2024-01-15",
  "retirementDate": null,
  "employmentStatus": "ACTIVE"
}
```

## Skills

Route module: `routes/skills.js`

```text
GET    /api/v1/skills
GET    /api/v1/skills/:skillId
POST   /api/v1/skills
PATCH  /api/v1/skills/:skillId
DELETE /api/v1/skills/:skillId
GET    /api/v1/skills/:skillId/employees
GET    /api/v1/skills/:skillId/requirements
```

Employee skill records:

```text
GET    /api/v1/employees/:employeeId/skills
PUT    /api/v1/employees/:employeeId/skills/:skillId
DELETE /api/v1/employees/:employeeId/skills/:skillId
```

`proficiency` accepts `1` through `5`. `yearsExperience` accepts non-negative decimal values. `verified` accepts a boolean.

## Roles

Route module: `routes/roles.js`

```text
GET    /api/v1/roles
GET    /api/v1/roles/:roleId
POST   /api/v1/roles
PATCH  /api/v1/roles/:roleId
DELETE /api/v1/roles/:roleId
GET    /api/v1/roles/:roleId/skill-requirements
GET    /api/v1/roles/:roleId/readiness
```

Role skill requirements:

```text
PUT    /api/v1/roles/:roleId/skill-requirements/:skillId
DELETE /api/v1/roles/:roleId/skill-requirements/:skillId
```

## Organization Data

Route modules: `routes/departments.js`, `routes/facilities.js`, `routes/teams.js`

```text
GET /api/v1/departments
GET /api/v1/departments/:departmentId
GET /api/v1/departments/:departmentId/employees
GET /api/v1/departments/:departmentId/skills

GET /api/v1/facilities
GET /api/v1/facilities/:facilityId
GET /api/v1/facilities/:facilityId/employees

GET /api/v1/teams
GET /api/v1/teams/:teamId
GET /api/v1/teams/:teamId/employees
```

## Workforce Scenarios

Route module: `routes/scenarios.js`

```text
GET    /api/v1/scenarios
GET    /api/v1/scenarios/:scenarioId
POST   /api/v1/scenarios
PATCH  /api/v1/scenarios/:scenarioId
DELETE /api/v1/scenarios/:scenarioId
GET    /api/v1/scenarios/:scenarioId/skill-requirements
GET    /api/v1/scenarios/:scenarioId/gaps
```

Scenario skill requirements:

```text
PUT    /api/v1/scenarios/:scenarioId/skill-requirements/:skillId
DELETE /api/v1/scenarios/:scenarioId/skill-requirements/:skillId
```

## Development Plans

Route module: `routes/development-plans.js`

```text
GET    /api/v1/development-plans
GET    /api/v1/development-plans/:planId
POST   /api/v1/development-plans
PATCH  /api/v1/development-plans/:planId
DELETE /api/v1/development-plans/:planId
GET    /api/v1/development-plans/:planId/items
POST   /api/v1/development-plans/:planId/items
PATCH  /api/v1/development-plans/:planId/items/:skillId
DELETE /api/v1/development-plans/:planId/items/:skillId
```

Plan status values:

```text
ACTIVE
PAUSED
COMPLETE
ARCHIVED
```

Item types include `COURSE`, `PROJECT`, `MENTORING`, `CERTIFICATION`, and `JOB_ROTATION`.

## Learning Courses

Route module: `routes/courses.js`

```text
GET    /api/v1/courses
GET    /api/v1/courses/:courseId
POST   /api/v1/courses
PATCH  /api/v1/courses/:courseId
DELETE /api/v1/courses/:courseId
GET    /api/v1/courses/:courseId/enrollments
POST   /api/v1/courses/:courseId/enrollments
DELETE /api/v1/courses/:courseId/enrollments/:employeeId
```

Enrollment status values:

```text
ENROLLED
IN_PROGRESS
COMPLETE
CANCELLED
```

## Business Processes

Route module: `routes/business-processes.js`

```text
GET    /api/v1/business-processes
GET    /api/v1/business-processes/:processId
POST   /api/v1/business-processes
PATCH  /api/v1/business-processes/:processId
DELETE /api/v1/business-processes/:processId
GET    /api/v1/business-processes/:processId/pain-points
POST   /api/v1/business-processes/:processId/pain-points
PATCH  /api/v1/business-processes/:processId/pain-points/:category
DELETE /api/v1/business-processes/:processId/pain-points/:category
```

Pain-point severity accepts `1` through `5`.

## AI Use Cases

Route module: `routes/ai-use-cases.js`

```text
GET    /api/v1/ai-use-cases
GET    /api/v1/ai-use-cases/:useCaseId
POST   /api/v1/ai-use-cases
PATCH  /api/v1/ai-use-cases/:useCaseId
DELETE /api/v1/ai-use-cases/:useCaseId
POST   /api/v1/ai-use-cases/generate
GET    /api/v1/ai-use-cases/:useCaseId/skill-requirements
GET    /api/v1/ai-use-cases/:useCaseId/readiness
```

Use-case skill requirements:

```text
PUT    /api/v1/ai-use-cases/:useCaseId/skill-requirements/:skillId
DELETE /api/v1/ai-use-cases/:useCaseId/skill-requirements/:skillId
```

Scores accept `0` through `100`.

## Succession Risks

Route module: `routes/succession-risks.js`

```text
GET    /api/v1/succession-risks
GET    /api/v1/succession-risks/:riskId
POST   /api/v1/succession-risks
PATCH  /api/v1/succession-risks/:riskId
DELETE /api/v1/succession-risks/:riskId
```

Risk records store experts, successors, risk level, and retirement horizon. Do not infer missing retirement data.

## Reports and Notifications

Route modules: `routes/reports.js`, `routes/notifications.js`

```text
GET    /api/v1/reports
GET    /api/v1/reports/:reportId
POST   /api/v1/reports
GET    /api/v1/reports/:reportId/download

GET    /api/v1/notifications
PATCH  /api/v1/notifications/:notificationId/read
PATCH  /api/v1/notifications/read-all
```

Report generation may become asynchronous. Return `202` with report status `PENDING` when generation does not finish during request.

## Analytics

Route module: `routes/analytics.js`

```text
GET /api/v1/analytics/dashboard
GET /api/v1/analytics/insights
GET /api/v1/analytics/skills-heatmap
GET /api/v1/analytics/skill-gaps
GET /api/v1/analytics/role-readiness
GET /api/v1/analytics/scenario-gaps
GET /api/v1/analytics/ai-readiness
GET /api/v1/analytics/succession
```

Analytics endpoints return calculated values. Client does not duplicate business calculations.

Supported filters:

```text
departmentId
facilityId
scenarioId
roleId
skillId
targetDate
```

## Versioning and Migration

Implement new routes under `/api/v1`. Keep current `/api` routes as temporary aliases during client migration. Remove aliases after all client loaders use `/api/v1`.

Split current `workforce.js` by resource. Keep `services/workforce.js` only for shared analytics until resource-specific services exist.
