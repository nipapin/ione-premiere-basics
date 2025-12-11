"use client";

import PlayArrow from "@mui/icons-material/PlayArrow";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import HeroVideo from "../media/HeroVideo";

export default function HeroPlayButton() {
	const [open, setOpen] = useState<boolean>(false);

	const toggle = (state: boolean) => () => setOpen(state);

	return (
		<>
			<Button
				variant="contained"
				sx={{
					display: "flex",
					gap: "1rem",
					position: "absolute",
					zIndex: 2,
					aspectRatio: 1,
					p: "1rem",
					transition: "0.3s",
					"&:hover p": { display: "block" },
					"&:hover": { aspectRatio: "auto" },
				}}
				className="abs-center"
				onClick={toggle(true)}
			>
				<PlayArrow />
				<Typography sx={{ display: "none" }}>Learn about Odin Pro in 2 minutes</Typography>
			</Button>
			<Box className={"tint"} />
			<Dialog
				open={open}
				onClose={toggle(false)}
				slotProps={{
					paper: {
						elevation: 0,
						sx: {
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: "fit-content",
							maxWidth: "none",
						},
					},
				}}
			>
				<HeroVideo controls={true} />
			</Dialog>
		</>
	);
}
