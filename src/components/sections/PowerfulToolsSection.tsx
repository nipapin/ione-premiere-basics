"use client";

import React, { useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import { Box, Button, Stack, Typography } from "@mui/material";
import Image from "next/image";

type PowerfulTool = {
	id: number;
	label: string;
	media: string;
};

const powerfulTools: PowerfulTool[] = [
	{ id: 1, label: "Transitions", media: "/images/cover-poster.webp" },
	{ id: 2, label: "Effects", media: "/images/cover-poster.webp" },
	{ id: 3, label: "Motion Graphics", media: "/images/cover-poster.webp" },
	{ id: 4, label: "Sound FX", media: "/images/cover-poster.webp" },
	{ id: 5, label: "Assets", media: "/images/cover-poster.webp" }
];

const styles = {
	section: {
		display: "flex",
		gap: { xs: "1rem", md: "2rem" },
		alignItems: "center",
		flexDirection: "column",
		padding: { xs: "2rem 0", md: "4rem 0" },
		width: "100%",
		maxWidth: "1200px",
		margin: "0 auto"
	},
	title: {
		fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
		fontWeight: 400,
		textAlign: "center"
	},
	toolsGrid: {
		display: "grid",
		gridTemplateColumns: {
			xs: "repeat(6, 1fr)",
			sm: "repeat(6, 1fr)",
			md: `repeat(${powerfulTools.length}, 1fr)`
		},
		gap: { xs: "0.5rem", sm: "1rem" },
		width: "100%",
		maxWidth: "1200px",
		margin: "0 auto"
	},
	toolButton: (isActive: boolean, index: number) => ({
		color: isActive ? "var(--primary)" : "currentColor",
		borderColor: isActive ? "var(--primary)" : "currentColor",
		padding: { xs: "0.5rem", sm: "1rem" },
		transition: "all 0.3s ease",
		gridColumn: { md: "span 1", sm: `span ${Math.floor(index / 3) + 2}`, xs: `span ${Math.floor(index / 3) + 2}` }
	}),
	imageContainer: {
		width: "100%",
		maxWidth: { xl: "1200px", sm: "100%" },
		aspectRatio: "16/9",
		height: "auto",
		display: "flex",
		"& img": {
			width: "100%",
			height: "auto",
			borderRadius: "8px",
			boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
		}
	}
};

export default function PowerfulTools() {
	const [active, setActive] = useState<number>(0);

	return (
		<Wrapper component='section' sx={styles.section}>
			<Typography variant='h2' sx={styles.title}>
				Powerful Tools
			</Typography>
			<Box sx={styles.toolsGrid}>
				{powerfulTools.map((tool, index) => (
					<Button key={tool.id} sx={styles.toolButton(index === active, index)} variant='outlined' onClick={() => setActive(index)}>
						<Typography sx={{ textWrap: "nowrap", fontSize: { xs: "0.875rem", sm: "1rem" } }}>{tool.label}</Typography>
					</Button>
				))}
			</Box>
			<Box sx={styles.imageContainer}>
				<Wrapper variant='animated' fullWidth>
					<Image src={powerfulTools[active].media} alt={powerfulTools[active].label} width={1280} height={720} priority />
				</Wrapper>
			</Box>
		</Wrapper>
	);
}
