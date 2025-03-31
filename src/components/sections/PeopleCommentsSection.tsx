import { comments } from "@/entities/comments";
import { Avatar, Box, Card, CardHeader, Typography } from "@mui/material";
import { Wrapper } from "../layout/Wrapper";
import Title from "../ui/Title";

export default function PeopleCommentsSection() {
	return (
		<Box component={"section"} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", maxWidth: "1280px", py: "4rem" }}>
			<Title>What people are saying</Title>
			<Box sx={{ display: "grid", gridTemplateColumns: { md: "1fr 1fr 1fr", xs: "1fr" }, gap: "1rem" }}>
				{comments.map((comment) => {
					return (
						<Wrapper key={comment.id} variant='animated' angleOffset={90 * comment.id}>
							<Box
								sx={{
									display: "flex",
									background: "var(--background-gradient)",
									height: "100%",
									p: "2rem",
									flexDirection: "column"
								}}
							>
								<Typography fontSize='1.5rem' fontWeight={300} mb={"14rem"}>
									{comment.quote}
								</Typography>
								<Card elevation={0} sx={{ background: "transparent", mt: "auto" }}>
									<CardHeader
										sx={{ p: 0 }}
										avatar={<Avatar src={comment.avatar} variant='circular' />}
										title={comment.name}
										subheader={comment.bio}
									/>
								</Card>
							</Box>
						</Wrapper>
					);
				})}
			</Box>
		</Box>
	);
}
