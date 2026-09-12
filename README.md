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

## Demo workforce data

After the baseline database seed, add a small fictional workforce with:

```bash
docker compose exec -T server npm run db:seed:demo
```

For a local Node server, run `npm run db:seed:demo --prefix server` with its database connection configured.

The demo adds 16 employees across the existing five departments, 3 skills, 62 assessments, 4 development plans, 6 course enrollments, and one workforce scenario. It preserves existing records and uses stable IDs, so rerunning it does not create duplicates. All inserts run in one transaction. The dashboard's hardcoded Development example does not change when this data is seeded. Succession Risk reads stored risk profiles; these profiles are not automatically recalculated from employee assessments.

## Building for Production

```bash
npm run build
```

Builds the client only; the server has no build step (plain Node/Express).

---

Built with ❤️ using React Router + Express.
