import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

// Example: call the separate backend server from a loader (server-to-server).
// API_URL is set in client/.env — see client/.env.example.
export async function loader() {
  const apiUrl = process.env.API_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/api/health`);
    const health = await res.json();
    return { health };
  } catch {
    return { health: null };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Welcome />
      <p style={{ textAlign: "center", fontSize: "0.8rem", opacity: 0.6 }}>
        API status: {loaderData.health ? loaderData.health.status : "unreachable"}
      </p>
    </>
  );
}
