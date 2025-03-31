import { members } from "@/entities/members";
import { Facebook, Instagram, X } from "@mui/icons-material";
import { Box, Card, CardActions, CardContent, CardMedia, IconButton, Typography } from "@mui/material";

export default function TeamSection() {
	return (
		<Box component={"section"} sx={{ display: "flex", alignItems: "center", flexDirection: "column", gap: "1rem", py: "4rem", maxWidth: "1200px" }}>
			<Typography sx={{ fontSize: "4rem", fontWeight: 400, mb: "2rem" }}>Our Team</Typography>
			<Box sx={{ display: "grid", gridTemplateColumns: { xl: "repeat(4, 1fr)", sm: "1fr 1fr", xs: "1fr" }, gap: "1rem" }}>
				{members.map((member) => {
					return (
						<Card
							key={member.id}
							sx={{
								borderRadius: "1rem",
								background: "var(--background-gradient)"
							}}
						>
							<CardMedia image={member.media} sx={{ aspectRatio: 1 }} />
							<CardContent>
								<Typography fontWeight={200} whiteSpace={"balance"} gutterBottom>
									{member.bio}
								</Typography>
								<Typography sx={{ fontWeight: 400, fontSize: "1.5rem", mt: "1rem" }}>{member.name}</Typography>
							</CardContent>
							<CardActions>
								<IconButton>
									<Facebook />
								</IconButton>
								<IconButton>
									<X />
								</IconButton>
								<IconButton>
									<Instagram />
								</IconButton>
							</CardActions>
						</Card>
					);
				})}
			</Box>
		</Box>
	);
}
