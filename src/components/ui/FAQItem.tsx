"use client";

import { FAQ } from "@/entities/faqs";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Box, Button, Collapse, Divider, Typography } from "@mui/material";
import { useState } from "react";

export default function FAQItem({ faq }: { faq: FAQ }) {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<Box
			sx={{
				background: "var(--background-gradient)",
				borderRadius: "1rem 1rem 0 0"
			}}
		>
			<Button
				fullWidth
				onClick={() => setOpen(!open)}
				sx={{ color: "white", borderRadius: "1rem 1rem 0 0" }}
				endIcon={open ? <ExpandLess /> : <ExpandMore />}
			>
				<Typography textAlign={"start"} width={"100%"} fontSize={"1.3rem"} fontWeight={400}>
					{faq.title}
				</Typography>
			</Button>
			<Divider />
			<Collapse in={open}>
				<Typography p='1rem' fontWeight={200}>
					{faq.description}
				</Typography>
			</Collapse>
		</Box>
	);
}
