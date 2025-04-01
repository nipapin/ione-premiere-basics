import Article from "@/components/help/Article";
import { readFileSync } from "fs";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import path from "path";

interface HelpPageProps {
	params: Promise<{ article: string; category: string }>;
}

export default async function HelpPage({ params }: HelpPageProps) {
	const { category, article } = await params;

	const mdxPath = path.join(process.cwd(), `src/markdown/${category}/${article}.mdx`);
	const mdxSource = readFileSync(mdxPath, "utf-8");
	const mdx = matter(mdxSource);
	const source = await serialize(mdx.content);

	return <Article source={source} />;
}
