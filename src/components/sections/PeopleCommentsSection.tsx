import React from "react";
import { Wrapper } from "../layout/Wrapper";
import {
	Avatar,
	Box,
	Card,
	CardHeader,
	Stack,
	Typography
} from "@mui/material";

type Comment = {
	id: number;
	name: string;
	bio: string;
	quote: string;
	avatar: string;
};

const comments: Comment[] = [
	{
		id: 1,
		name: "Wade Warren",
		bio: "CEO, Since Industry",
		avatar:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/testimonials/avatar-small.png",
		quote:
			"GTIS Partners is a leading real estate investment firm in the Americas, headquartered in New York with offices in São Paulo, San Francisco, Los Angeles, Atlanta, Charlotte, Phoenix"
	},
	{
		id: 2,
		name: "Wade Warren",
		bio: "CEO, Since Industry",
		avatar:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/testimonials/avatar-small.png",
		quote:
			"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly"
	},
	{
		id: 3,
		name: "Wade Warren",
		bio: "CEO, Since Industry",
		avatar:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/testimonials/avatar-small.png",
		quote:
			"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 5 BC, making it over 2000 years"
	}
];

export default function PeopleCommentsSection() {
	return (
		<Stack
			component={"section"}
			direction={"column"}
			alignItems={"center"}
			sx={{ py: "4rem", maxWidth: { xl: "70vw", md: "none" } }}
		>
			<Typography
				fontWeight={400}
				fontSize={"4rem"}
				textAlign={"center"}
				mb={"2rem"}
			>
				What people are saying
			</Typography>
			<Box
				display={"grid"}
				gridTemplateColumns={{ md: "1fr 1fr 1fr", xs: "1fr" }}
				gap={2}
			>
				{comments.map((comment) => {
					return (
						<Wrapper
							key={comment.id}
							variant='animated'
							angleOffset={90 * comment.id}
						>
							<Wrapper
								display={"flex"}
								flexDirection={"column"}
								padding={{ xl: "2rem", md: "1.5rem", xs: "1rem" }}
								sx={{
									background: "var(--background-gradient)",
									height: "100%"
								}}
							>
								<Typography fontSize='1.5rem' fontWeight={300} mb={"14rem"}>
									{comment.quote}
								</Typography>
								<Card
									elevation={0}
									sx={{ background: "transparent", mt: "auto" }}
								>
									<CardHeader
										sx={{ p: 0 }}
										avatar={<Avatar src={comment.avatar} variant='circular' />}
										title={comment.name}
										subheader={comment.bio}
									/>
								</Card>
							</Wrapper>
						</Wrapper>
					);
				})}
			</Box>
		</Stack>
	);
}
