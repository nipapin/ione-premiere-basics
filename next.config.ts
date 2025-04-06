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
	},
	experimental: {
		serverActions: {
			allowedOrigins: ["localhost:3000", "193.164.128.81", "odin-pro.com"]
		}
	}
};

export default nextConfig;
