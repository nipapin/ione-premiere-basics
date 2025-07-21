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
						{`Smart features\nthat save you time`}
					</Typography>
					<Typography sx={{ ...styles.subheading, display: { sm: "block", xs: "none" } }}>
						{`Discover powerful tools built to simplify your workflow.\nFrom quick customization to adaptive scaling and flexible timing.\nThis extension is made to move as fast as you do.`}
					</Typography>
					<Typography
						variant='h2'
						sx={{ ...styles.heading, display: { sm: "none", xs: "block" }, fontSize: "2rem", textAlign: "center" }}
					>
						{`Smart features\nthat save you time`}
					</Typography>
					<Typography
						sx={{
							...styles.subheading,
							display: { sm: "none", xs: "block" },
							textAlign: "center",
							textWrap: "balance",
							whiteSpace: { sm: "pre", xs: "discard" },
							width: "fit-content"
						}}
					>
						{`Discover powerful tools built to simplify your workflow.\nFrom quick customization to adaptive scaling and flexible timing.\nThis extension is made to move as fast as you do.`}
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
							fullWidth
							onClick={() => setActive(index)}
							startIcon={item.icon}
						>
							<Typography fontWeight={index === active ? 400 : 300}>{item.label}</Typography>
						</Button>
					))}
				</Stack>
			</Box>
			<Wrapper variant='animated' sx={styles.imageWrapper}>
				<video src={toggleItems[active].media} autoPlay muted loop playsInline width={1280} height={720} />
			</Wrapper>
		</Box>
	);
}
