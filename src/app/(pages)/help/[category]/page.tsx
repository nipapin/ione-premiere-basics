import { Box, LinearProgress, Typography } from "@mui/material";
import { readdir } from "fs/promises";
// import { serialize } from "next-mdx-remote/serialize";
// import { MDXRemote } from "next-mdx-remote";
import path from "path";
import { readFileSync } from "fs";
import matter from "gray-matter";
import { notFound, redirect } from "next/navigation";

interface CategoryPageProps {
	params: Promise<{ category: string }>;
}

const toSlug = (title: string) =>
	title.toLowerCase().replace(/[^a-z0-9]/g, "-");

export default async function CategoryPage({ params }: CategoryPageProps) {
	const { category } = await params;

	const docsDirectory = path.join(process.cwd(), `src/markdown/${category}`);

	const docs = await readdir(docsDirectory);
	let article;
	for (const doc of docs) {
		const mdxPath = `${docsDirectory}/${doc}`;
		const mdxSource = readFileSync(mdxPath, "utf-8");
		article = matter(mdxSource);

		if (!article.data.prev) break;
	}

	if (!article) {
		notFound();
	} else {
		redirect(`/help/${category}/${toSlug(article.data.title)}`);
	}

	return (
		<Box display={"flex"} flexDirection={"column"} gap={2} padding={2}>
			<Typography>Loading Documentation</Typography>
			<LinearProgress />
		</Box>
	);
}
