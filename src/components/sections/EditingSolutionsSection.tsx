"use client";

import { styles, toggleItems } from "@/entities/toggles";
import { Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useState } from "react";
import { Wrapper } from "../layout/Wrapper";

export default function EditingSolutions() {
	const [active, setActive] = useState<number>(0);

	return (
		<Box component='section' sx={styles.section}>
			<Box sx={styles.contentWrapper}>
				<Box sx={styles.textWrapper}>
					<Typography variant='h2' sx={{ ...styles.heading, display: { sm: "block", xs: "none" } }}>
						{`Editing solutions\ndriving growth\nand efficiency`}
					</Typography>
					<Typography sx={{ ...styles.subheading, display: { sm: "block", xs: "none" } }}>
						{`Our extension is a tool that outline your creative\nperformance and projections for you and your clients.`}
					</Typography>
					<Typography variant='h2' sx={{ ...styles.heading, display: { sm: "none", xs: "block" }, fontSize: "2rem", textAlign: "center" }}>
						{`Editing solutions driving\ngrowth and efficiency`}
					</Typography>
					<Typography sx={{ ...styles.subheading, display: { sm: "none", xs: "block" }, textAlign: "center" }}>
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
			</Box>
			<Wrapper variant='animated' sx={styles.imageWrapper}>
				<Image src={toggleItems[active].media} alt={toggleItems[active].label} width={1280} height={720} priority />
			</Wrapper>
		</Box>
	);
}
