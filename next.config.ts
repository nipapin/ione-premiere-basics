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
			allowedOrigins: [
				"localhost:3000",
				"193.164.128.81",
				"odin-pro.com",
				"api.get-atomx.com",
				"c5ad-2605-e440-2-00-3-1fc.ngrok-free.app"
			]
		}
	}
};

export default nextConfig;
