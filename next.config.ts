import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // Recommended since accurate types require the `supabase gen types` command.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
