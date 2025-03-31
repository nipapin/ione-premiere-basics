import { blogs } from "@/entities/blogs";
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import Link from "next/link";

const titleToRoute = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, "-");

export default function BlogSection() {
	return (
		<Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", gap: "1rem", py: "4rem", maxWidth: "1280px" }} component={"section"}>
			<Typography sx={{ fontWeight: 400, fontSize: "4rem", mb: "2rem" }} fontWeight={400} fontSize={"4rem"}>
				Blog
			</Typography>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xl: "repeat(3, 1fr)", sm: "1fr 1fr", xs: "1fr" },
					gap: "1rem",
					"& div:last-child": { display: { md: "block", sm: "none", xs: "block" } }
				}}
			>
				{blogs.map((blog) => {
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
				})}
			</Box>
			<Link href={"/blog"} passHref legacyBehavior>
				<Button href='' variant='outlined' sx={{ mt: "2rem" }}>
					View All
				</Button>
			</Link>
		</Box>
	);
}
