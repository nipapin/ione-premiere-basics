import { Blog } from "@/entities/blogs";
import { readdirSync, readFileSync } from "fs";
import matter from "gray-matter";
import path from "path";

export const getBlogs = async () => {
	const blogs = readdirSync(path.join(process.cwd(), "src/markdown/blog"));
	const blogsData = blogs.map((blog, index) => {
		const blogData = readFileSync(path.join(process.cwd(), "src/markdown/blog", blog), "utf-8");
		const { data } = matter(blogData);
		return { ...data, id: index } as Blog;
	});
	return blogsData;
};
