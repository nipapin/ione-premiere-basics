import Article from "@/components/help/Article";
import PageContainer from "@/components/layout/PageContainer";
import { Wrapper } from "@/components/layout/Wrapper";
import StyledLink from "@/components/ui/StyledLink";
import { NavigateNext } from "@mui/icons-material";
import { Box, Breadcrumbs, Paper, Typography } from "@mui/material";
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
		<PageContainer>
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
					<Typography>{mdx.data.title}</Typography>
				</Breadcrumbs>
			</Paper>
			<Wrapper variant='animated' fullWidth sx={{ maxWidth: "1280px" }}>
				<Box
					sx={{
						background: "var(--background-gradient)",
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						overflow: "hidden"
					}}
				>
					<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", p: "2rem" }}>
						<Typography variant='h2' fontSize={"4rem"} fontWeight={400}>
							{mdx.data.title}
						</Typography>
						<Typography variant='body1' fontSize={"1.5rem"}>
							{mdx.data.description}
						</Typography>
					</Box>
					<Box sx={{ "& img": { width: "auto", height: "100%" } }}>
						<Image src={mdx.data.media} alt={mdx.data.title} width={1000} height={1000} />
					</Box>
				</Box>
			</Wrapper>
			<Article source={source} sx={{ width: "100%", maxWidth: "1280px", "& h1": { textWrap: "balance" } }} />
		</PageContainer>
	);
}
