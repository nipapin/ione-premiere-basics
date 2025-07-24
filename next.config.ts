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
			allowedOrigins: ["193.164.128.81", "odin-pro.com", "api.get-atomx.com", "149.22.90.115", "localhost:3000"]
		}
	}
};

export default nextConfig;
