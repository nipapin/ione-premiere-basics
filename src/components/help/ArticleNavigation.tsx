"use client";

import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import { usePathname } from "next/navigation";

interface Heading {
	id: string;
	text: string;
}

export default function ArticleNavigation() {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const pathname = usePathname();

	useEffect(() => {
		const h2Elements = document.querySelectorAll("h2");
		const headingList = Array.from(h2Elements).map((h2) => ({
			id: h2.id || h2.textContent?.toLowerCase().replace(/\s+/g, "-") || "",
			text: h2.textContent || ""
		}));
		setHeadings(headingList);
		window.scrollTo(0, 0);
	}, [pathname]);

	const scrollToHeading = (id: string) => () => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	if (headings.length === 0) return null;

	return (
		<Wrapper variant='animated' fullWidth>
			<Box sx={{ p: "2rem", background: "var(--background-gradient)", width: "100%" }}>
				<Typography variant='h6' sx={{ mb: 2, fontWeight: 500 }}>
					Table of Contents
				</Typography>
				<List>
					{headings.map((heading) => (
						<ListItem key={heading.id} disablePadding>
							<ListItemButton onClick={scrollToHeading(heading.id)} sx={{ borderRadius: "0.5rem" }}>
								<ListItemText primary={heading.text} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Box>
		</Wrapper>
	);
}
