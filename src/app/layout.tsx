import type { Metadata } from "next";

import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";
import { Wrapper } from "@/components/layout/Wrapper";
import NavBarBoundingProvider from "@/contexts/NavBarBoundingProvider";
import UserWrapper from "@/contexts/UserWrapper";
import ThemeWrapper from "@/theme/ThemeWrapper";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
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
	return (
		<html lang='en'>
			<head>
				<link href='https://api.fontshare.com/v2/css?f[]=clash-grotesk@200,300,400,500,600,700&display=swap' rel='stylesheet' />
			</head>
			<body>
				<AppRouterCacheProvider options={{ key: "odin" }}>
					<NavBarBoundingProvider>
						<UserWrapper>
							<ThemeWrapper>
								<Wrapper display={"flex"} flexDirection={"column"} minHeight={"100vh"}>
									<NavBar />
									{children}
									<Footer />
								</Wrapper>
							</ThemeWrapper>
						</UserWrapper>
					</NavBarBoundingProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
