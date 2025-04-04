import { Box } from "@mui/material";
import type { Metadata } from "next";
import AccountNavigation from "@/components/layout/AccountNavigation";
import { Wrapper } from "@/components/layout/Wrapper";

export const metadata: Metadata = {
	title: "Premiere Basics | Account",
	description: "Premiere Basics"
};

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<Box
			sx={{
				width: "100%",
				maxWidth: "1280px",
				p: "1rem",
				m: "0 auto",
				"& p, & a, & h2, & h1": {
					textAlign: "start"
				}
			}}
		>
			<Box
				sx={{
					display: { lg: "grid", xs: "flex" },
					gridTemplateColumns: { lg: "1fr 3fr", xs: "1fr" },
					flexDirection: { lg: "row", xs: "column" },
					gap: "2rem",
					minHeight: "100vh",
					py: { lg: "4rem", xs: "2rem" }
				}}
			>
				<AccountNavigation />
				<Wrapper fullWidth variant='animated' sx={{ height: "fit-content" }}>
					<Wrapper
						sx={{
							background: "var(--background-gradient)",
							height: "fit-content",
							p: { lg: "2rem", xs: "2rem 1rem" }
						}}
						fullWidth
					>
						{children}
					</Wrapper>
				</Wrapper>
			</Box>
		</Box>
	);
}
