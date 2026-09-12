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

## Building for Production

```bash
npm run build
```

Builds the client only; the server has no build step (plain Node/Express).

---

Built with ❤️ using React Router + Express.
