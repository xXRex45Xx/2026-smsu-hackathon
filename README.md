# 2026 SMSU Hackathon

Two-server project: React Router frontend (`client/`) + Express API backend (`server/`).

## Structure

```
├── client/    # React Router v7 app (SSR, Vite, TailwindCSS)
└── server/    # Express API server
```

## Getting Started

### Installation

Install dependencies for both servers:

```bash
npm run install:all
```

### Environment variables

Copy the example env files:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

`client/.env` sets `API_URL` (where the React Router server calls the backend from loaders).
`server/.env` sets `PORT` and `CLIENT_ORIGIN` (CORS).

### Development

Run both servers together:

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`

Run them separately if needed:

```bash
npm run dev:client
npm run dev:server
```

## Client (`client/`)

React Router v7, SSR on by default. See [client/README.md](client/README.md) for details, or [reactrouter.com](https://reactrouter.com/).

## Server (`server/`)

Plain Express app. Routes live in `server/src/routes/`. `GET /api/health` is the example route.

## Knowledge Transfer and Local AI

The Knowledge Transfer page includes a career advisor, source ingestion, structured
knowledge modules, a review queue, assignments and training history. AI calls run
on the Express backend through LM Studio. The frontend never calls LM Studio.

Start LM Studio's local server with a chat model loaded. The backend defaults are
shown in `server/.env.lm-studio.example`:

```dotenv
LM_STUDIO_BASE_URL=http://10.14.241.2:1234/v1
LM_STUDIO_API_KEY=lm-studio
```

Run the backend on the machine hosting LM Studio, or configure a reachable,
trusted server address. A deployed backend's loopback address does not point to
your laptop. Model selection uses `/v1/models` and, when available, the native
model-state endpoint to distinguish loaded models from downloaded models.
Generation uses `/v1/chat/completions` with a validated JSON schema.
See the [LM Studio structured-output documentation](https://lmstudio.ai/docs/developer/openai-compat/structured-output).

For local development, Knowledge Transfer uses the frontend's same-origin Vite
proxy to the local backend at `http://127.0.0.1:3001`. Legacy `API_URL` and
`VITE_API_URL` settings may still point to the hosted workforce API. Set
`KNOWLEDGE_API_URL` in the client environment to change the proxy target, or
`VITE_KNOWLEDGE_API_URL` to explicitly use a different API directly. Production
builds default to `VITE_API_URL`; direct API requests need a matching
`CLIENT_ORIGIN`. Start the backend with `npm start --prefix server` and the client
with `npm run dev:client`.

Before saving live records, run the additive database migration:

```bash
cd server
npm run db:migrate
```

Configure Clerk on both apps. New knowledge endpoints verify the Clerk token;
the frontend supplies its session token. Set a trusted user's Clerk public
metadata `skillbridgeRole` to `manager`, `expert`, or `admin` to permit generation,
editing, skill creation, approval, assignment and verification of live records.
For employees, set Clerk private metadata `employeeId` to their existing workforce
ID. Employees can read their own assignments and submit completion evidence.
These role checks apply to the new knowledge endpoints; legacy workforce CRUD
routes retain their existing authorization behavior.

Anonymous visitors and database outages receive clearly labeled sample profiles.
Sample AI results can be edited and exported, but cannot change live records.
The backend must be running for source extraction or AI generation. Draft saves,
approvals, assignments, and audit history require a migrated PostgreSQL database.

Documents support PDF, DOCX, TXT and Markdown, up to 10 MB. PDF extraction reads up
to 40 pages; scanned PDFs require OCR before import. Videos support MP4, MOV and
WebM up to 100 MB and 30 minutes, using codecs supported by the browser. Selecting
a video automatically samples up to 12 chronological frames (at most 768 pixels
per side) and sends those JPEGs to a loaded LM Studio vision model. No pasted
transcript is required. Video files stay in the browser; sampled frames are
processed in memory and are not stored. The generated visual observations and
timestamps can be reviewed before generating the module. Audio and actions
between sampled frames are not analyzed, and automatic speech transcription is
not provided. Only reviewed text and source metadata are retained in saved drafts.
Model selection uses LM Studio's [vision capabilities and loaded instances](https://lmstudio.ai/docs/developer/rest/list),
with the legacy `vlm` model type as a fallback. Image inputs use its
[compatible Chat Completions endpoint](https://lmstudio.ai/docs/developer/openai-compat/chat-completions).
GitHub imports accept public repository, branch/folder (`tree`) and individual
documentation file (`blob`) URLs. Folder imports include only documentation in
that folder and its subfolders. Imports are capped at 12 files and 24,000
characters. Repository code is never downloaded or executed.

Editing an approved module creates a new draft revision. Existing assignments
retain an immutable snapshot of their assigned revision. A manager must verify
completion evidence and explicitly assess each skill before proficiency changes.
Updates preserve higher existing proficiency, update development-plan progress,
and are reflected in live workforce and role-readiness analytics. Completion is
idempotent. Audit events record the actor and action for all persisted changes.

Run `npm test --prefix server`, `npm run typecheck --prefix client`, and
`npm run build --prefix client` to verify the implementation.
The database integration test is opt-in: set `KNOWLEDGE_TEST_DATABASE_URL` to a
dedicated database named `skillbridge_knowledge_test` before running the server
tests. It migrates that database, verifies the complete approval-to-completion
workflow, and removes its test records. Never use a production database for tests.

## Production Build

```bash
npm run build
```

Builds the client only; the server has no build step (plain Node/Express).

---

Built with ❤️ using React Router + Express.
