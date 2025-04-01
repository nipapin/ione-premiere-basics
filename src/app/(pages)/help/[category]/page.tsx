import { readFileSync } from "fs";
import { readdir } from "fs/promises";
import matter from "gray-matter";
import { redirect } from "next/navigation";
import path from "path";

interface CategoryPageProps {
	params: Promise<{ category: string }>;
}

type Article = {
	data: Record<string, string>;
	content: string;
};

const toSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, "-");

export default async function CategoryPage({ params }: CategoryPageProps) {
	const { category } = await params;

	const docsDirectory = path.join(process.cwd(), `src/markdown/${category}`);

	let article: Article | null = null;

	const docs = await readdir(docsDirectory);
	for (const doc of docs) {
		const mdxPath = `${docsDirectory}/${doc}`;
		const mdxSource = readFileSync(mdxPath, "utf-8");
		article = matter(mdxSource);

		if (!article.data.prev) break;
	}

	if (article) {
		redirect(`/help/${category}/${toSlug((article as Article).data.title)}`);
	}
}
