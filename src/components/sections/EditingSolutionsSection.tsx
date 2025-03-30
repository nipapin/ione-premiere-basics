"use client";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import { Stack, useTheme, useMediaQuery, Box } from "@mui/material";
import Image from "next/image";

type ToggleItem = {
	id: number;
	label: string;
	media: string;
};

const toggleItems: ToggleItem[] = [
	{
		id: 1,
		label: "Scale your business and sales model",
		media: "/images/cover-poster.webp"
	},
	{
		id: 2,
		label: "Lorem ipsum dolor sit amet, consectetur adipiscing",
		media: "/images/cover-poster.webp"
	},
	{
		id: 3,
		label: "Scale your business with sales assembly",
		media: "/images/cover-poster.webp"
	}
];

const styles = {
	section: {
		display: { xl: "grid", xs: "flex" },
		flexDirection: { xl: "grid", xs: "column" },
		gridTemplateColumns: { xl: "420px 100px 1fr", xs: "1fr" },
		alignContent: "center",
		gap: 2,
		maxWidth: { lg: "1200px", xl: "70vw" },
		py: { xl: "4rem", xs: "2rem" }
	},
	contentWrapper: {
		display: "flex",
		flexDirection: { xl: "column", xs: "row" },
		alignItems: "center",
		justifyContent: { xl: "center", xs: "space-between" },
		width: "100%"
	},
	heading: {
		fontWeight: 400,
		whiteSpace: "pre",
		fontSize: { xl: "2.5rem", md: "2rem", xs: "1.75rem" }
	},
	subheading: {
		fontWeight: 200,
		whiteSpace: "pre",
		mb: "2rem",
		fontSize: { xl: "1.25rem", md: "1.1rem", xs: "1rem" }
	},
	buttonStack: {
		width: { xl: "100%" }
	},
	button: {
		width: { xl: "fit-content", xs: "100%" },
		textAlign: { xl: "left", xs: "center" },
		justifyContent: { xl: "flex-start", xs: "center" },
		padding: "1rem"
	},
	imageWrapper: {
		"& img": {
			width: "100%",
			height: "auto",
			borderRadius: "8px",
			boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
		},
		width: "100%",
		height: "auto",
		aspectRatio: "16/9"
	},
	textWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: "1rem"
	}
};

export default function EditingSolutions() {
	const [active, setActive] = useState<number>(0);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("xl"));

	return (
		<Wrapper component='section' sx={styles.section} fullWidth>
			<Wrapper sx={styles.contentWrapper}>
				<Box sx={styles.textWrapper}>
					<Typography variant='h2' sx={styles.heading} gutterBottom>
						{`Editing solutions\ndriving growth\nand efficiency`}
					</Typography>
					<Typography sx={styles.subheading}>
						{`Our extension is a tool that outline your creative\nperformance and projections for you and your clients.`}
					</Typography>
				</Box>
				<Stack direction='column' spacing={2} sx={styles.buttonStack}>
					{toggleItems.map((item, index) => (
						<Button
							sx={{
								...styles.button,
								color: index === active ? "var(--primary)" : "currentColor",
								borderColor: index === active ? "var(--primary)" : "currentColor",
								borderWidth: "1px"
							}}
							key={item.id}
							variant='outlined'
							onClick={() => setActive(index)}
						>
							<Typography fontWeight={300}>{item.label}</Typography>
						</Button>
					))}
				</Stack>
			</Wrapper>
			{!isMobile && <div />}
			<Wrapper variant='animated' sx={styles.imageWrapper}>
				<Image src={toggleItems[active].media} alt={toggleItems[active].label} width={1280} height={720} priority />
			</Wrapper>
		</Wrapper>
	);
}
