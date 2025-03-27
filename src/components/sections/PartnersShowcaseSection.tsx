import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LogoCarousel from "../media/LogoCarousel";

export default function PartnersShowcase() {
	return (
		<Box
			component={"section"}
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				gap: { xl: "2rem", xs: "1rem" },
				maxWidth: "100%"
			}}
		>
			<Typography
				fontSize={{ md: "1.5rem", xs: "0.8rem" }}
				textAlign={"center"}
			>
				<b>200,000+</b> teams have found focus with Premiere Basics
			</Typography>
			<LogoCarousel />
		</Box>
	);
}
