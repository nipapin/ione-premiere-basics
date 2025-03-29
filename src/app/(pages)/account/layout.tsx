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
				width: "70%",
				maxWidth: { lg: "var(--content-width)", md: "100%" },
				m: "0 auto",
				"& p, & a, & h2, & h1": {
					textAlign: "start"
				}
			}}
		>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 3fr",
					gap: "2rem",
					minHeight: "100vh",
					py: "4rem"
				}}
			>
				<AccountNavigation />
				<Wrapper fullWidth variant='animated'>
					<Wrapper
						sx={{ background: "var(--background-gradient)" }}
						fullWidth
						padding={"2rem"}
					>
						{children}
					</Wrapper>
				</Wrapper>
			</Box>
		</Box>
	);
}
