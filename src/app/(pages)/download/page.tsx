import { HelpOutline } from "@mui/icons-material";
import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { type Metadata } from "next";
import AEIcon from "./icons/ae";
import MacIcon from "./icons/mac";
import PRIcon from "./icons/pr";
import WinIcon from "./icons/win";
import { Wrapper } from "@/components/layout/Wrapper";
import StyledLink from "@/components/ui/StyledLink";

export const metadata: Metadata = {
	title: "Premiere Basics | Download",
	description: "Premiere Basics"
};

const styles = {
	stack: {
		display: { xl: "flex", xs: "none" },
		flexDirection: "column",
		gap: 2,
		mx: "auto",
		alignItems: "center",
		py: "4rem",
		maxWidth: { xl: "70vw", md: "none" },
		minHeight: "100vh"
	},
	accentChip: {
		display: "flex",
		alignItems: "center",
		p: "1rem"
	},
	h1: {
		fontSize: "4rem"
	},
	tagline: {
		textWrap: "balance",
		fontWeight: 200,
		textAlign: "center"
	},
	warning: {
		display: { lg: "none", md: "flex" },
		alignItems: "center",
		flexDirection: "column",
		borderRadius: "1rem",
		fontSize: "1.5rem",
		background: "#0080ff80",
		borderColor: "#0080ff"
	},
	panel: {
		display: "flex",
		flexDirection: "column",
		padding: "2rem",
		gap: "1rem",
		width: "100%",
		alignItems: "center",
		background: "var(--background-gradient)"
	}
};

export default function DownloadPage() {
	return (
		<Box
			display={"flex"}
			minHeight={"60vh"}
			alignItems={"center"}
			padding={{ xs: "1rem" }}
		>
			<WarningChip />
			<Stack sx={styles.stack}>
				<AccentChip />
				<Typography variant='h1' sx={styles.h1}>
					Download <b>Odin Pro</b> Extension.
				</Typography>
				<Typography sx={styles.tagline}>
					{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`}
				</Typography>
				<Stack
					direction={"row"}
					gap={4}
					width={"100%"}
					maxWidth={"50vw"}
					mt={"2rem"}
				>
					<Wrapper variant='animated' fullWidth>
						<Box sx={styles.panel}>
							<Typography fontSize={"2rem"} textAlign={"center"}>
								Odin Pro for <span className='primary'>Windows</span>
							</Typography>
							<Box sx={{ my: "4rem" }}>
								<WinIcon />
							</Box>
							<Typography>Extension version 1.03 - 305MB</Typography>
							<Button
								variant='contained'
								fullWidth
								sx={{ borderRadius: "0.5rem" }}
							>
								Download for Windows
							</Button>
						</Box>
					</Wrapper>
					<Wrapper variant='animated' fullWidth angleOffset={90}>
						<Box sx={styles.panel}>
							<Typography fontSize={"2rem"}>
								Odin Pro for <span className='primary'>Mac OS</span>
							</Typography>
							<Box sx={{ my: "4rem" }}>
								<MacIcon />
							</Box>
							<Typography>Extension version 1.03 - 305MB</Typography>
							<Button
								variant='contained'
								fullWidth
								sx={{ borderRadius: "0.5rem" }}
							>
								Download for Mac OS
							</Button>
						</Box>
					</Wrapper>
				</Stack>
				<InfoChip />
			</Stack>
		</Box>
	);
}

const AccentChip = () => {
	return (
		<Wrapper
			variant='outlined'
			borderRadius={"1rem"}
			sx={{ background: "var(--primary-glass)" }}
		>
			<Box sx={styles.accentChip}>
				<AEIcon />
				<PRIcon />
				<Typography
					ml={"1rem"}
					fontWeight={200}
					sx={{ "& a": { fontWeight: 400 } }}
				>
					Works with{" "}
					<StyledLink href={"https://www.adobe.com/products/aftereffects.html"}>
						After Effects
					</StyledLink>{" "}
					and{" "}
					<StyledLink href={"https://www.adobe.com/products/premiere.html"}>
						Premiere Pro
					</StyledLink>
				</Typography>
			</Box>
		</Wrapper>
	);
};

const WarningChip = () => {
	return (
		<Wrapper variant='outlined' sx={styles.warning}>
			<Box
				sx={{
					p: 1,
					display: "flex",
					alignItems: "center",
					flexDirection: "column",
					textAlign: "center",
					gap: 2
				}}
			>
				<span>
					<AEIcon />
					<PRIcon />
				</span>
				<Typography
					sx={{ textWrap: "balance", fontSize: "1.25rem" }}
					gutterBottom
				>
					The <b>Odin Pro</b> Extension is only available on desktop.
				</Typography>
				<Typography sx={{ fontSize: "1.25rem" }}>
					Download it from your PC or Mac.
				</Typography>
			</Box>
		</Wrapper>
	);
};

const InfoChip = () => {
	return (
		<Wrapper
			variant='outlined'
			sx={{
				borderRadius: "1rem",
				background: "var(--primary-glass)",
				mt: "2rem"
			}}
		>
			<Box
				sx={{ padding: "1rem", display: "flex", alignItems: "center", gap: 1 }}
			>
				<HelpOutline color='primary' />
				<Typography fontWeight={200}>
					Having trouble installing Odin Pro?
				</Typography>
				<StyledLink href='/help/getting-started/installation'>
					<Typography fontWeight={400} color='primary'>
						<u>See our full installation guide.</u>
					</Typography>
				</StyledLink>
			</Box>
		</Wrapper>
	);
};
