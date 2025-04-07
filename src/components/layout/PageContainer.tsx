import { Box, BoxProps } from "@mui/material";
import React from "react";

export default function PageContainer(props: BoxProps) {
	return (
		<Box
			{...props}
			sx={{
				width: "100%",
				maxWidth: "1280px",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				mx: "auto",
				px: { xl: 0, md: "2rem", xs: "1rem" },
				py: "4rem",
				gap: "4rem",
				overflowX: "hidden",
				...props.sx
			}}
		>
			{props.children}
		</Box>
	);
}
