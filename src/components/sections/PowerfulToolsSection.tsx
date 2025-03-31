"use client";

import { powerfulTools, styles } from "@/entities/tools";
import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import Title from "../ui/Title";

export default function PowerfulTools() {
	const [active, setActive] = useState<number>(0);

	return (
		<Box component='section' sx={styles.section}>
			<Title>Powerful Tools</Title>
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
		</Box>
	);
}
