import { Blog } from "@/entities/blogs";
import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import Link from "next/link";

const titleToRoute = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, "-");

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
			<Link href={`/blog/${titleToRoute(blog.title)}`} passHref legacyBehavior>
				<CardActionArea>
					<CardMedia
						image={blog.media}
						title={blog.title}
						sx={{
							height: { xl: "300px", xs: "150px" },
							backgroundPosition: "center top"
						}}
					/>
					<CardContent sx={{ p: "2rem" }}>
						<Typography fontSize={"1.5rem"} gutterBottom>
							{blog.title}
						</Typography>
						<Typography fontWeight={200}>{blog.description}</Typography>
					</CardContent>
				</CardActionArea>
			</Link>
		</Card>
	);
}
