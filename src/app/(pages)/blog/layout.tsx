import { getBlogs } from "@/actions/blog";
import BlogFilterProvider from "@/contexts/BlogFilterProvider";

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
	const blogs = await getBlogs();
	return <BlogFilterProvider initBlogs={blogs}>{children}</BlogFilterProvider>;
}
