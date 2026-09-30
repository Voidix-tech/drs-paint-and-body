import type { NextConfig } from "next";
const config: NextConfig = { poweredByHeader: false, experimental: { optimizePackageImports: ["@tabler/icons-react"] } };
export default config;
