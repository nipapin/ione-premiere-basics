import Article from "@/components/help/Article";
import PageContainer from "@/components/layout/PageContainer";
import StyledLink from "@/components/ui/StyledLink";
import { NavigateNext } from "@mui/icons-material";
import { Box, Breadcrumbs, Divider, Paper, Typography } from "@mui/material";
import { readFileSync } from "fs";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import Image from "next/image";
import path from "path";

interface BlogPostPageProps {
	params: Promise<{ post: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { post } = await params;

	const mdxPath = path.join(process.cwd(), `src/markdown/blog/${post}.mdx`);
	const mdxSource = readFileSync(mdxPath, "utf-8");
	const mdx = matter(mdxSource);
	const source = await serialize(mdx.content);

	return (
		<PageContainer sx={{ gap: { md: "2rem", xs: "1rem" } }}>
			<Paper
				variant='outlined'
				sx={{
					width: "100%",
					height: "100%",
					maxWidth: "1280px",
					p: "1rem",
					borderRadius: "1rem",
					zIndex: 1000
				}}
			>
				<Breadcrumbs separator={<NavigateNext fontSize='small' />}>
					<StyledLink href='/'>Home</StyledLink>
					<StyledLink href='/blog'>Blog</StyledLink>
					<Typography fontWeight={400} color={"primary"} sx={{ textWrap: "balance" }}>
						{mdx.data.title}
					</Typography>
				</Breadcrumbs>
			</Paper>
			<Box
				sx={{
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					overflow: "hidden"
				}}
			>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", py: "2rem", width: "700px" }}>
					<Typography variant='h2' sx={{ fontSize: { md: "4rem", xs: "2rem" }, fontWeight: 400, textWrap: "balance" }}>
						{mdx.data.title}
					</Typography>
					<Typography
						variant='body1'
						sx={{ fontSize: { md: "1.5rem", xs: "1rem" }, fontWeight: 200, textWrap: "balance" }}
					>
						{mdx.data.description}
					</Typography>
				</Box>
				<Box sx={{ display: { md: "block", xs: "none" }, width: "500px", "& img": { width: "100%", height: "100%" } }}>
					<Image src={mdx.data.media} alt={mdx.data.title} width={1000} height={1000} />
				</Box>
			</Box>
			<Box sx={{ width: "100%", display: { md: "none", xs: "block" }, "& img": { width: "100%", height: "auto" } }}>
				<Image src={mdx.data.media} alt={mdx.data.title} width={1000} height={1000} />
			</Box>
			<Divider sx={{ my: "1rem" }} flexItem />
			<Article source={source} sx={{ width: "100%", maxWidth: "1280px", "& h1": { textWrap: "balance" } }} />
		</PageContainer>
	);
}
