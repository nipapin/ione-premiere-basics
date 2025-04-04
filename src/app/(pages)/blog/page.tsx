import PageContainer from "@/components/layout/PageContainer";
import BlogFilter from "@/components/ui/BlogFilter";
import BlogPosts from "@/components/ui/BlogPosts";
import { Box, Divider, Typography } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Premiere Basics | Blog",
	description: "Read our blog"
};

export default async function BlogPage() {
	const tags = ["Premiere Pro", "After Effects"];

	return (
		<PageContainer sx={{ pt: { md: "4rem", xs: "2rem" } }}>
			<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "1280px" }}>
				<Typography variant='h1' sx={{ fontSize: "4rem", fontWeight: 400 }}>
					Blog
				</Typography>
				<Typography variant='body1'>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
					magna aliqua.
				</Typography>
				<Divider sx={{ my: "1rem" }} />
				<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
					<BlogFilter tags={tags} />
					<BlogPosts />
				</Box>
			</Box>
		</PageContainer>
	);
}
