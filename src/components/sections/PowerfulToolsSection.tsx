"use client";

import React, { useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import { Button, Stack, Typography } from "@mui/material";
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

export default function PowerfulTools() {
	const [active, setActive] = useState<number>(0);

	return (
		<Wrapper
			display={{ md: "flex", xs: "none" }}
			gap={4}
			alignItems={"center"}
			flexDirection={"column"}
			py={"4rem"}
		>
			<Typography
				variant='h2'
				fontSize={"4rem"}
				fontWeight={400}
				textAlign={"center"}
			>
				Powerful Tools
			</Typography>
			<Stack spacing={2} direction={"row"}>
				{powerfulTools.map((tool, index) => (
					<Button
						key={tool.id}
						sx={{
							color: index === active ? "var(--primary)" : "currentColor",
							borderColor: index === active ? "var(--primary)" : "currentColor"
						}}
						variant='outlined'
						onClick={() => setActive(index)}
					>
						{tool.label}
					</Button>
				))}
			</Stack>
			<Wrapper
				variant='animated'
				sx={{
					maxWidth: { xl: "60vw", md: "none" },
					height: "auto",
					aspectRatio: 16 / 9,
					"& img": {
						width: "100%",
						height: "auto",
						minWidth: { xl: 0, md: "70vw" }
					}
				}}
			>
				<Image
					src={powerfulTools[active].media}
					alt={powerfulTools[active].label}
					width={1280}
					height={720}
				/>
			</Wrapper>
		</Wrapper>
	);
}
