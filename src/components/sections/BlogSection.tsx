import React from "react";
import { Wrapper } from "../layout/Wrapper";
import {
	Button,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Stack,
	Typography
} from "@mui/material";
import Link from "next/link";

type Blog = {
	id: number;
	title: string;
	description: string;
	media: string;
};

const blogs: Blog[] = [
	{
		id: 1,
		title: "Stunning FX Creation",
		description:
			"Premiere Basics is a strategic branding agency focused on brand creation",
		media:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/blog/cash4.png"
	},
	{
		id: 2,
		title: "After Effects for Dummies",
		description:
			"Premiere Basics is a strategic branding agency focused on brand creation",
		media:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/blog/cash4.png"
	},
	{
		id: 3,
		title: "Premiere Pro for Dummies",
		description:
			"Premiere Basics is a strategic branding agency focused on brand creation",
		media:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/blog/cash4.png"
	}
];

const titleToRoute = (title: string) =>
	title.toLowerCase().replace(/[^a-z0-9]/g, "-");

export default function BlogSection() {
	return (
		<Stack direction={"column"} alignItems={"center"} spacing={4} py={"4rem"}>
			<Typography fontWeight={400} fontSize={"4rem"}>
				Blog
			</Typography>
			<Stack
				direction={{ md: "row", xs: "column" }}
				maxWidth={{ xl: "70vw", xs: "none" }}
				spacing={2}
			>
				{blogs.map((blog) => {
					return (
						<Card
							key={blog.id}
							sx={{
								borderRadius: { md: "2rem", xs: "1rem" },
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
							<Link
								href={`/blog/${titleToRoute(blog.title)}`}
								passHref
								legacyBehavior
							>
								<CardActionArea>
									<CardMedia
										image={blog.media}
										title={blog.title}
										sx={{
											height: { xl: "200px", xs: "150px" },
											backgroundPosition: "center top"
										}}
									/>
									<CardContent>
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
			</Stack>
			<Link href={"/blog"} passHref legacyBehavior>
				<Button href='' variant='outlined'>
					View All
				</Button>
			</Link>
		</Stack>
	);
}
