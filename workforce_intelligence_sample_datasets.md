# Workforce Intelligence Platform: Sample Database Datasets

This document provides example datasets and database tables for the Workforce Intelligence Platform, including the integrated AI Opportunity Discovery feature.

## 1. Employees

### `employees`

| id | name | title | team_id | role_id | manager_id |
| --- | --- | --- | --- | --- | --- |
| e1 | Alice Johnson | Software Engineer | t1 | r1 | e4 |
| e2 | Brian Lee | Data Analyst | t2 | r2 | e5 |
| e3 | Maria Gomez | Cloud Engineer | t1 | r3 | e4 |
| e4 | David Smith | Engineering Manager | t1 | r4 | NULL |

## 2. Skills

### `skills`

| id | name | category |
| --- | --- | --- |
| s1 | React | Software Engineering |
| s2 | Node.js | Software Engineering |
| s3 | Machine Learning | AI |
| s4 | LLM Engineering | AI |
| s5 | AWS | Cloud |
| s6 | AI Governance | AI |

## 3. Employee Skills

### `employee_skills`

This is one of the central tables in the system. It connects employees to the skills they possess.

| employee_id | skill_id | proficiency | years_experience | verified |
| --- | --- | ---: | ---: | --- |
| e1 | s1 | 4 | 3 | true |
| e1 | s2 | 4 | 3 | true |
| e1 | s4 | 2 | 0.5 | false |
| e2 | s3 | 4 | 3 | true |
| e2 | s4 | 3 | 1 | true |
| e3 | s5 | 5 | 5 | true |
| e3 | s4 | 2 | 0.5 | false |

#### Suggested Proficiency Scale

| Level | Meaning |
| ---: | --- |
| 1 | Awareness |
| 2 | Beginner |
| 3 | Working |
| 4 | Advanced |
| 5 | Expert |

## 4. Roles

### `roles`

| id | name | job_family | level |
| --- | --- | --- | --- |
| r1 | Software Engineer | Engineering | Mid |
| r2 | Data Analyst | Data | Mid |
| r3 | Cloud Engineer | Infrastructure | Senior |
| r4 | Engineering Manager | Engineering | Manager |
| r5 | AI Engineer | AI | Senior |

## 5. Role Skill Requirements

### `role_skill_requirements`

This describes the skills and proficiency levels required for each role.

| role_id | skill_id | required_level | importance |
| --- | --- | ---: | ---: |
| r5 | s3 | 4 | 5 |
| r5 | s4 | 4 | 5 |
| r5 | s2 | 3 | 3 |
| r5 | s5 | 3 | 3 |
| r5 | s6 | 2 | 4 |

This enables the system to compare an employee's current skills against the requirements of a target role and calculate skill gaps.

## 6. Workforce Scenarios

### `workforce_scenarios`

Future workforce scenarios represent strategic plans that may change the skills an organization needs.

| id | name | target_date | description |
| --- | --- | --- | --- |
| ws1 | AI Transformation 2028 | 2028-01-01 | Expand internal AI capabilities |
| ws2 | Cloud Modernization | 2027-06-01 | Move major workloads to cloud |

## 7. Future Skill Requirements

### `future_skill_requirements`

| scenario_id | skill_id | required_people | required_level |
| --- | --- | ---: | ---: |
| ws1 | s4 | 10 | 4 |
| ws1 | s3 | 8 | 4 |
| ws1 | s6 | 3 | 3 |
| ws2 | s5 | 12 | 4 |

#### Example Analysis

- **LLM Engineering**
  - Future requirement: 10 people at proficiency level 4+
  - Current qualified workforce: 2 people
  - Workforce gap: 8 people

## 8. Development Plans

### `development_plans`

| id | employee_id | title | target_role_id | status |
| --- | --- | --- | --- | --- |
| dp1 | e1 | Become an AI Engineer | r5 | ACTIVE |
| dp2 | e3 | AI Cloud Specialization | r5 | ACTIVE |

### `development_plan_items`

| plan_id | skill_id | type | current_level | target_level | status |
| --- | --- | --- | ---: | ---: | --- |
| dp1 | s3 | COURSE | 1 | 4 | IN_PROGRESS |
| dp1 | s4 | PROJECT | 2 | 4 | PLANNED |
| dp1 | s6 | MENTORING | 1 | 2 | PLANNED |

Development types can include courses, certifications, mentoring, projects, job rotations, and other learning experiences.

## AI Opportunity Discovery Datasets

## 9. Business Processes

### `business_processes`

| id | name | team | employees_involved | hours_per_week |
| --- | --- | --- | ---: | ---: |
| bp1 | Customer Support Ticket Handling | Support | 35 | 700 |
| bp2 | Invoice Processing | Finance | 8 | 120 |

## 10. Process Pain Points

### `process_pain_points`

| process_id | category | description | severity |
| --- | --- | --- | ---: |
| bp1 | KNOWLEDGE_ACCESS | Agents spend time searching documentation | 5 |
| bp1 | REPETITIVE_WORK | Similar questions answered repeatedly | 5 |
| bp2 | DATA_ENTRY | Invoice data entered manually | 4 |

## 11. AI Use Cases

### `ai_use_cases`

| id | process_id | name | value_score | complexity | risk |
| --- | --- | --- | ---: | ---: | ---: |
| ai1 | bp1 | AI Support Assistant | 90 | 55 | 35 |
| ai2 | bp2 | Automated Invoice Extraction | 78 | 40 | 25 |

## 12. AI Use Case Skill Requirements

### `ai_use_case_skill_requirements`

This table connects AI opportunity discovery directly to the workforce skills system.

| use_case_id | skill_id | required_level | required_people |
| --- | --- | ---: | ---: |
| ai1 | s4 | 4 | 2 |
| ai1 | s6 | 3 | 1 |
| ai1 | s5 | 3 | 2 |
| ai2 | s3 | 3 | 1 |
| ai2 | s5 | 3 | 1 |

#### Example Workforce Readiness Analysis: AI Support Assistant

| Skill | Required | Currently Qualified |
| --- | ---: | ---: |
| LLM Engineering | 2 | 0 |
| AI Governance | 1 | 0 |
| AWS | 2 | 1 |

**Workforce readiness:** 35%

**Primary capability gap:** LLM Engineering

The platform can use these gaps to recommend training, mentoring, certifications, job rotations, or project experiences before the organization attempts the AI implementation.

## Core Data Relationship

The shared `skills` dataset is the central connection between workforce intelligence, future planning, career development, and AI opportunity discovery.

```text
Employees
    ↓
Employee Skills
    ↓
Skills
    ↑
    ├── Role Skill Requirements
    ├── Future Skill Requirements
    └── AI Use Case Skill Requirements
```

This architecture allows the platform to answer both:

1. **What capabilities does our workforce currently have, and what capabilities will we need?**
2. **Which AI opportunities should we pursue, and does our workforce have the skills needed to implement them?**
