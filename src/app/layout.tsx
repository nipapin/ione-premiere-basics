import type { Metadata } from "next";

import { get } from "@/actions/user";
import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";
import NavBarBoundingProvider from "@/contexts/NavBarBoundingProvider";
import UserWrapper from "@/contexts/UserWrapper";
import ThemeWrapper from "@/theme/ThemeWrapper";
import { Box } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
	title: "Premiere Basics",
	description: "Get our extension Odin Pro now!"
};

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;
	let initialUser = null;

	if (user_id) {
		initialUser = await get(user_id);
	}

	return (
		<html lang='en'>
			<head>
				<link href='https://api.fontshare.com/v2/css?f[]=clash-grotesk@200,400&display=swap' rel='stylesheet' />
			</head>
			<body>
				<AppRouterCacheProvider options={{ key: "odin" }}>
					<NavBarBoundingProvider>
						<UserWrapper initialUser={initialUser} userID={user_id}>
							<ThemeWrapper>
								<Box sx={{ width: "100vw", overflowX: "hidden", maxWidth: "100%" }}>
									<NavBar />
									{children}
									<Footer />
								</Box>
							</ThemeWrapper>
						</UserWrapper>
					</NavBarBoundingProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
