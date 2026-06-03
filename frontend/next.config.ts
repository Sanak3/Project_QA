import type { NextConfig } from "next";

// URL interna para alcancar o backend.
// - Em dev local: backend roda no host -> http://localhost:3000 (default).
// - Em Docker Compose: backend e outro container -> http://backend:3000
//   (passamos via env BACKEND_INTERNAL_URL no docker-compose.yml).
const BACKEND_INTERNAL_URL =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${BACKEND_INTERNAL_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;