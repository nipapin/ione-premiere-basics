import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import BlogCard from "../layout/BlogCard";
import { Blog } from "@/entities/blogs";
import Title from "../ui/Title";

export default function BlogSection({ blogs }: { blogs: Blog[] }) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				flexDirection: "column",
				gap: "1rem",
				py: "4rem",
				maxWidth: "1280px"
			}}
			component={"section"}
		>
			<Title>Blog</Title>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xl: "repeat(3, 1fr)", sm: "1fr 1fr", xs: "1fr" },
					gap: "1rem",
					"& div:last-child": { display: { md: "block", sm: "none", xs: "block" } }
				}}
			>
				{blogs.map((blog) => {
					return <BlogCard key={blog.id} blog={blog} />;
				})}
			</Box>
			<Link href={"/blog"} passHref legacyBehavior>
				<Button href='' variant='outlined' sx={{ mt: "2rem" }}>
					View All
				</Button>
			</Link>
		</Box>
	);
}
