import { getBlogs } from "@/actions/blog";
import BlogCard from "@/components/layout/BlogCard";
import PageContainer from "@/components/layout/PageContainer";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Premiere Basics | Blog",
	description: "Read our blog"
};

export default async function BlogPage() {
	const blogs = await getBlogs();

	return (
		<PageContainer>
			<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "1280px" }}>
				<Typography variant='h1' sx={{ fontSize: "4rem", fontWeight: 400 }}>
					Blog
				</Typography>
				<Typography variant='body1'>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
				</Typography>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
					<Typography variant='h2' sx={{ fontSize: "2rem" }}>
						Latest Posts
					</Typography>
					<Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
						{blogs.map((blog) => {
							return <BlogCard key={blog.id} blog={blog} />;
						})}
					</Box>
				</Box>
			</Box>
		</PageContainer>
	);
}
