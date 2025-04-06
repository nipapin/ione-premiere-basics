import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "static.shuffle.dev"
			},
			{
				protocol: "https",
				hostname: "lzsyykhroxoqmjgoxhrs.supabase.co"
			}
		],
		localPatterns: [{ pathname: "/images/**" }]
	}
};

export default nextConfig;
