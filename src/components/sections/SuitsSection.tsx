import { Box, Typography } from "@mui/material";
import { Wrapper } from "../layout/Wrapper";
import { suits } from "@/entities/suits";
import Title from "../ui/Title";

export default function SuitsSection() {
	return (
		<Box component={"section"} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", maxWidth: "1280px", py: "4rem" }}>
			<Title>{`Suitable for\nall content creator's`}</Title>
			<Typography fontWeight={200} mt='-1rem' mb='2rem' textAlign={"center"}>
				The plugin is ideal for absolutely all professions who want to achieve great results by creating attractive and effective videos.
			</Typography>
			<Box sx={{ display: "grid", gridTemplateColumns: { xl: "repeat(3, 1fr)", sm: "1fr 1fr", xs: "1fr" }, gap: "1rem" }}>
				{suits.map((suit, index) => {
					return (
						<Wrapper key={suit.id} variant='animated' angleOffset={(index * 360) / suits.length}>
							<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", background: "var(--background-gradient)", p: "2rem" }}>
								{suit.icon}
								<Typography sx={{ fontSize: "1.5rem", fontWeight: 400, mb: "6rem" }}>{suit.title}</Typography>
								<Typography fontWeight={200}>{suit.description}</Typography>
							</Box>
						</Wrapper>
					);
				})}
			</Box>
		</Box>
	);
}
