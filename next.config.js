/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [{ protocol: "https", hostname: "static.shuffle.dev" }]
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				punycode: false
			};
		}
		return config;
	},
	productionBrowserSourceMaps: true
};

module.exports = nextConfig;
