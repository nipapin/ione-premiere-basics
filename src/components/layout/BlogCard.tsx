import { Blog } from "@/entities/blogs";
import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import Link from "next/link";

export default function BlogCard({ blog }: { blog: Blog }) {
	return (
		<Card
			key={blog.id}
			sx={{
				borderRadius: "2rem",
				background: "var(--background-gradient)",
				"& .MuiCardMedia-root": {
					transition: "all 0.3s",
					backgroundSize: "100%"
				},
				"&:hover .MuiCardMedia-root": {
					backgroundSize: "110%"
				}
			}}
			elevation={0}
		>
			<Link href={`/blog/${blog.slug}`} passHref legacyBehavior>
				<CardActionArea sx={{ height: "100%" }}>
					<CardMedia
						image={blog.media}
						title={blog.title}
						sx={{
							height: { xl: "250px", xs: "200px" },
							backgroundPosition: "center top"
						}}
					/>
					<CardContent sx={{ p: { md: "2rem", xs: "1rem" } }}>
						<Typography fontSize={"1.5rem"} sx={{ textWrap: "balance" }} gutterBottom>
							{blog.title}
						</Typography>
						<Typography fontWeight={200} sx={{ textWrap: "balance" }}>
							{blog.description}
						</Typography>
					</CardContent>
				</CardActionArea>
			</Link>
		</Card>
	);
}
