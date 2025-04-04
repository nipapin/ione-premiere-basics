"use client";

import { useBlogFilter } from "@/contexts/BlogFilterProvider";
import { Box, Skeleton } from "@mui/material";
import BlogCard from "../layout/BlogCard";

export default function BlogPosts() {
	const { blogs, isLoading } = useBlogFilter();

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { lg: "repeat(3, 1fr)", md: "repeat(2, 1fr)", xs: "1fr" },
				gap: "2rem 1rem"
			}}
		>
			{isLoading
				? Array(3)
						.fill(0)
						.map((_, index) => {
							return (
								<Skeleton
									component={"div"}
									variant='rounded'
									height={250}
									key={index}
									sx={{ width: "100%", borderRadius: "1rem" }}
								/>
							);
						})
				: blogs.map((blog) => {
						return <BlogCard key={blog.id} blog={blog} />;
				  })}
		</Box>
	);
}
