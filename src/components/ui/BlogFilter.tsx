"use client";

import { useBlogFilter } from "@/contexts/BlogFilterProvider";
import { Button, Typography } from "@mui/material";
import Box from "@mui/material/Box";

type BlogFilterProps = {
	tags: string[];
};

export default function BlogFilter({ tags }: BlogFilterProps) {
	const { toggleTag, selectedTags } = useBlogFilter();

	return (
		<Box
			sx={{
				display: "flex",
				gap: "1rem",
				alignItems: { md: "center", xs: "flex-start" },
				my: "2rem",
				flexDirection: { md: "row", xs: "column" }
			}}
		>
			<Typography variant='h4'>Our Posts:</Typography>
			<Box
				sx={{
					ml: { md: "auto", xs: 0 },
					display: "flex",
					gap: "0.5rem",
					alignItems: "center",
					width: { md: "auto", xs: "100%" }
				}}
			>
				<Typography sx={{ fontSize: "1.2rem", fontWeight: 400, mr: { md: 0, xs: "auto" } }}>Filters:</Typography>
				{tags.map((tag) => {
					return (
						<Button
							sx={{ border: "1px solid var(--primary)" }}
							variant={selectedTags.includes(tag) ? "contained" : "outlined"}
							size='small'
							key={tag}
							onClick={() => toggleTag(tag)}
						>
							<Typography sx={{ fontSize: "1rem" }}>{tag}</Typography>
						</Button>
					);
				})}
			</Box>
		</Box>
	);
}
