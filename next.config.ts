import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "static.shuffle.dev"
			},
		],
		localPatterns: [{ pathname: "/images/**" }]
	},
	experimental: {
		serverActions: {
			allowedOrigins: ["193.164.128.81", "198.199.123.239", "157.230.8.40", "odin-pro.com", "api.get-atomx.com", "149.22.90.115", "localhost:3000"]
		}
	}
};

export default nextConfig;
