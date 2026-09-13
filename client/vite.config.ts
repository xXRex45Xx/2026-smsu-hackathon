import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      proxy: {
        "/api/v1/knowledge": {
          target: env.KNOWLEDGE_API_URL || "http://127.0.0.1:3001",
          changeOrigin: true,
          timeout: 210000,
          proxyTimeout: 210000,
        },
      },
    },
  };
});
