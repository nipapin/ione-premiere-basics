import Article from "@/components/help/Article";
import { Container } from "@mui/material";
import { readFileSync } from "fs";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import path from "path";

export default async function PrivacyPolicy() {
	const mdxPath = path.join(process.cwd(), `src/markdown/privacy-policy.mdx`);
	const mdxSource = readFileSync(mdxPath, "utf-8");
	const mdx = matter(mdxSource);
	const source = await serialize(mdx.content);

	return (
		<Container maxWidth='xl' sx={{ py: "6rem" }}>
			<Article source={source} sx={{ maxWidth: "none", "& *": { textWrap: "balance" } }} />
		</Container>
	);
}
