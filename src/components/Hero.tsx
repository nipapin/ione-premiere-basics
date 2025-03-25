import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import HeroVideoPlayer from "./HeroVideoPlayer";
import StyledLink from "./StyledLink";

const styles = {
	hero: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		py: "4rem",
		width: "100%"
	},
	accentChip: {
		border: "1px solid var(--primary)",
		width: "fit-content",
		p: "1rem",
		borderRadius: "999px",
		background: "var(--primary-glass)",
		"& *": { fontSize: { xl: "1rem", xs: "0.8rem" }, fontWeight: 200 }
	},
	h1: {
		fontSize: { xl: "4rem", md: "3rem", xs: "1.75rem" },
		mt: "2rem",
		whiteSpace: "pre",
		textAlign: "center"
	},
	tagline: {
		whiteSpace: "pre",
		textAlign: "center",
		mt: { xl: "2rem", xs: "1rem" },
		fontSize: { xl: "1.25rem", md: "1rem", xs: "0.8rem" },
		fontWeight: 200
	},
	buttons: {
		my: { xl: "4rem", md: "3rem", xs: "2rem" }
	}
};

export default function Hero() {
	return (
		<Box component={"section"} sx={styles.hero}>
			<Box sx={styles.accentChip}>
				<Typography>
					This extension made by{" "}
					<StyledLink href={"https://www.youtube.com/@PremiereBasics"}>
						<Typography
							color='var(--primary)'
							component={"span"}
							sx={{ textDecoration: "underline" }}
						>
							Premiere Basics
						</Typography>
					</StyledLink>
				</Typography>
			</Box>
			<Typography sx={styles.h1}>
				{`Discover the most powerful\ntime saver for video editing`}
			</Typography>
			<Typography
				sx={styles.tagline}
			>{`Premiere Basics is a strategic branding agency\nfocused on brand creation, rebrands, and brand`}</Typography>
			<Stack direction={"row"} spacing={2} sx={styles.buttons}>
				<Button variant='contained'>
					<Typography fontWeight={500}>Start now for free</Typography>
				</Button>
				<Button variant='outlined'>
					<Typography>Log In</Typography>
				</Button>
			</Stack>
			<HeroVideoPlayer />
		</Box>
	);
}
