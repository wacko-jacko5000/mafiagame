import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mafia-game/config", "@mafia-game/types"]
};

export default nextConfig;
