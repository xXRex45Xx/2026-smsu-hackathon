# SkillBridge Backend Implementation Plan

## Scope

Build backend with Express.js, PostgreSQL, and Drizzle ORM. Use Docker and Docker Compose for local and production-like environments.

Clerk authentication is outside this plan. API routes remain open during backend development. Do not expose this configuration publicly before authentication is added.

## Phase Status

- [x] Phase 1: Docker and Express Foundation
- [x] Phase 2: Drizzle Schema and Seed Data
- [x] Phase 3: Read APIs and Analytics
- [x] Phase 4: Mutations and Client Integration
- [x] Phase 5: Testing and Deployment Hardening

## Current Project Status

- Client uses React Router v8, Vite, SSR, and Clerk UI components.
- Express server exposes workforce read and mutation APIs.
- PostgreSQL and Drizzle ORM are configured with migrations and seed data.
- Docker Compose runs PostgreSQL, server, and client services.
- Client dashboard routes load data through the Express API.
- Course enrollment, report download, and use-case generation call backend mutations.

## Dataset Model

Implement these core tables from `workforce_intelligence_sample_datasets.md`:

- `employees`
- `skills`
- `employee_skills`
- `roles`
- `role_skill_requirements`
- `workforce_scenarios`
- `future_skill_requirements`
- `development_plans`
- `development_plan_items`
- `business_processes`
- `process_pain_points`
- `ai_use_cases`
- `ai_use_case_skill_requirements`

The client also needs data not present in the dataset. Add these supporting tables and fields:

- `departments`
- `facilities`
- `learning_courses`
- `course_enrollments`
- `reports`
- `notifications`
- Employee fields: `department_id`, `facility_id`, `hire_date`, `retirement_date`, `employment_status`

Do not derive succession risk from incomplete sample data. Store retirement and successor inputs explicitly, or label results as demo analysis.

## Phase 1: Docker and Express Foundation

Create:

```text
docker-compose.yml
server/Dockerfile
server/drizzle.config.js
server/src/db/client.js
server/src/db/schema.js
server/src/db/migrations/
server/src/db/seed.js
server/src/middleware/
server/src/services/
server/src/routes/
```

Compose services:

- `postgres`
- `server`
- `client`

Configure a PostgreSQL named volume, shared network, service health checks, and container startup dependencies.

Add server dependencies:

- `drizzle-orm`
- `drizzle-kit`
- `pg`
- `zod`
- `tsx` when scripts require TypeScript execution

Add environment values:

```text
DATABASE_URL=postgresql://skillbridge:skillbridge@postgres:5432/skillbridge
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

Register Express middleware in this order:

1. CORS
2. JSON parser
3. Request validation
4. API routes
5. 404 handler
6. Central error handler

Keep `GET /api/health`. Make it verify PostgreSQL connectivity.

## Phase 2: Drizzle Schema and Seed Data

Define normalized PostgreSQL tables with Drizzle.

Add:

- Foreign keys for all relationships
- Composite primary keys for relationship tables
- Unique skill names
- Proficiency checks from `1` through `5`
- Non-negative people and score checks
- Controlled status and type values
- Indexes on foreign keys and dashboard filters
- Created and updated timestamps on mutable records

Generate and run versioned migrations:

```bash
npm run db:generate --prefix server
npm run db:migrate --prefix server
npm run db:seed --prefix server
```

Seed exact values from `workforce_intelligence_sample_datasets.md`.

Seed client-only demo values separately and label them as demo data. Do not silently combine mock values with source dataset values.

Verify:

- Migrations work on an empty PostgreSQL container.
- Seed execution is repeatable.
- Foreign keys reject invalid records.
- Composite uniqueness prevents duplicate relationships.
- Data survives PostgreSQL container restart.

## Phase 3: Read APIs and Analytics

Add open development endpoints:

```text
GET /api/dashboard/summary
GET /api/insights
GET /api/skills
GET /api/development-plans
GET /api/succession-risks
GET /api/courses
GET /api/use-cases
GET /api/reports
GET /api/departments
GET /api/facilities
```

Support these query parameters where applicable:

```text
departmentId
facilityId
scenarioId
status
page
limit
sort
```

Keep SQL and business calculations in service/query modules, not route handlers.

Server-side analytics must calculate:

- Workforce readiness
- Average proficiency
- Skill coverage by department
- Current versus future skill gaps
- Qualified employees per requirement
- Workforce scenario gaps
- Employee readiness for target roles
- AI use-case workforce readiness
- Primary capability gaps
- Succession risk from explicit retirement and successor data

Use a stable response format:

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

## Phase 4: Mutations and Client Integration

Add mutation endpoints:

```text
POST /api/development-plans
PATCH /api/development-plans/:id
PATCH /api/development-plan-items/:id
POST /api/course-enrollments
DELETE /api/course-enrollments/:courseId
POST /api/use-cases/generate
POST /api/reports
GET /api/reports/:id/download
PATCH /api/notifications/:id/read
```

Replace imports from `client/app/data/skillbridge.ts` with React Router loaders, actions, or a shared API client.

Wire pages as follows:

- Home: dashboard summary and heat map API
- Insights: aggregate workforce analytics API
- Skills: filtered skills API
- Development: plans and plan-item mutation APIs
- Succession: succession-risk API
- Learning: course and enrollment APIs
- Use Cases: persisted use cases and generation API
- Reports: report metadata and download API
- Admin: database and integration status API

Remove local-only behavior for enrollment, downloads, idea pagination, dashboard metrics, charts, and tables.

Add loading, empty, validation, and server-error states.

## Phase 5: Testing and Deployment Hardening

Test:

- Schema migrations
- Repeatable seeds
- Foreign-key behavior
- API filters and pagination
- Invalid request payloads
- Analytics calculations
- Mutation behavior
- PostgreSQL integration
- Docker startup and health checks

Add:

- PostgreSQL connection retry
- Graceful connection-pool shutdown
- Structured request logging
- Centralized JSON error responses
- Pagination limits
- CORS allowlist
- Production Compose configuration
- Migration-before-start command

Authentication remains a separate follow-up. Add Clerk middleware and authorization before production exposure.

## Execution Order

1. Build Docker Compose and database connection.
2. Define Drizzle schema, migrations, and seed data.
3. Build read APIs and analytics queries.
4. Replace client mocks with loaders and API calls.
5. Add mutations, tests, and deployment hardening.
