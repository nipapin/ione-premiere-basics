import { Typography, TypographyProps } from "@mui/material";
import React from "react";

export default function Title({ children, ...props }: TypographyProps) {
	return (
		<Typography
			variant='h2'
			sx={{
				fontSize: { xl: "4rem", md: "3rem", sm: "3rem", xs: "1.9rem" },
				textWrap: "balance",
				textAlign: "center",
				fontWeight: 400,
				maxWidth: "90vw",
				mb: "1rem"
			}}
			{...props}
		>
			{children}
		</Typography>
	);
}
