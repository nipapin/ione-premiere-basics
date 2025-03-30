import { Box, CircularProgress } from "@mui/material";
import Image from "next/image";
import React from "react";

export default function Preloader() {
	return (
		<Box
			sx={{
				width: "100vw",
				height: "100vh",
				background: "var(--background-gradient)",
				position: "fixed",
				top: 0,
				left: 0,
				zIndex: 1000,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				gap: "1rem"
			}}
		>
			<Image src={"/images/odin.webp"} alt='logo' width={100} height={100} />
			<CircularProgress sx={{ color: "var(--primary)" }} />
		</Box>
	);
}
