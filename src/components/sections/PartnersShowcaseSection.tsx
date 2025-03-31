import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LogoCarousel from "../media/LogoCarousel";

const styles = {
	box: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "column",
		gap: "1rem",
		width: "100%",
		maxWidth: "1200px",
		mx: "auto",
		py: "4rem",
		pt: "6rem"
	}
};

export default function PartnersShowcase() {
	return (
		<Box component={"section"} sx={styles.box}>
			<Typography fontSize={{ md: "1.5rem", xs: "0.8rem" }} textAlign={"center"}>
				<b>200,000+</b> teams have found focus with Premiere Basics
			</Typography>
			<LogoCarousel />
		</Box>
	);
}
