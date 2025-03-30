"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import HeroVideoPlayer from "../media/HeroVideoPlayer";
import StyledLink from "../ui/StyledLink";
import { useUser } from "@/contexts/UserWrapper";
import Link from "next/link";
import { ArrowForwardIos } from "@mui/icons-material";
import { useNavBarBounding } from "@/contexts/NavBarBoundingProvider";

const styles = {
	hero: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		py: { xl: "4rem", md: "3rem", sm: "2rem", xs: "1.5rem" },
		px: { xl: "2rem", md: "1.5rem", sm: "1rem", xs: "0.5rem" },
		width: "100%",
		minHeight: { xl: "100vh", md: "90vh", sm: "85vh", xs: "80vh" }
	},
	accentChip: {
		border: "1px solid var(--primary)",
		width: "fit-content",
		p: { xl: "1rem", md: "0.8rem", sm: "0.7rem", xs: "0.6rem" },
		borderRadius: "999px",
		background: "var(--primary-glass)",
		"& *": {
			fontSize: { xl: "1rem", md: "0.9rem", sm: "0.85rem", xs: "0.75rem" },
			fontWeight: 200
		}
	},
	h1: {
		fontSize: { xl: "4rem", md: "3.5rem", sm: "2.5rem", xs: "1.5rem" },
		lineHeight: { xl: "1.2", md: "1.3", sm: "1.4", xs: "1.2" },
		mt: { xl: "2rem", md: "1.5rem", sm: "1.25rem", xs: "1rem" },
		whiteSpace: "pre",
		textAlign: "center",
		maxWidth: { xl: "100%", md: "90%", sm: "85%", xs: "95%" },
		fontWeight: 500
	},
	tagline: {
		whiteSpace: "pre",
		textAlign: "center",
		mt: { xl: "2rem", md: "1.5rem", sm: "1.25rem", xs: "1rem" },
		fontSize: { xl: "1.25rem", md: "1.1rem", sm: "1rem", xs: "0.9rem" },
		fontWeight: 200,
		maxWidth: { xl: "100%", md: "90%", sm: "85%", xs: "95%" }
	},
	buttons: {
		display: "flex",
		my: { xl: "4rem", md: "3rem", sm: "2.5rem", xs: "2rem" },
		flexDirection: { xs: "column", sm: "row" },
		width: { xs: "100%", sm: "auto" },
		gap: { xl: "1rem", md: "0.5rem", sm: "0.25rem", xs: "0.1rem" },
		"& .MuiButton-root": {
			width: { xs: "100%", sm: "auto" },
			mb: { xs: 1, sm: 0 }
		}
	}
};

export default function Hero() {
	const user = useUser();
	return (
		<Box component={"section"} sx={{ ...styles.hero }}>
			<Box sx={styles.accentChip}>
				<Typography>
					This extension made by{" "}
					<StyledLink href={"https://www.youtube.com/@PremiereBasics"}>
						<Typography color='var(--primary)' component={"span"} sx={{ textDecoration: "underline" }}>
							Premiere Basics
						</Typography>
					</StyledLink>
				</Typography>
			</Box>
			<Typography variant='h1' sx={styles.h1}>{`Discover the most powerful\ntime saver for video editing`}</Typography>
			<Typography
				sx={{
					...styles.tagline
				}}
			>{`Premiere Basics is a strategic branding agency\nfocused on brand creation, rebrands, and brand`}</Typography>
			<Box sx={{ ...styles.buttons }}>
				<Link href={user ? "/download" : "/login"} passHref legacyBehavior>
					<Button variant='contained' href=''>
						<Typography fontWeight={500}>Getting Started</Typography>
					</Button>
				</Link>
				<Link href={"/features"} passHref legacyBehavior>
					<Button variant='outlined' href='' endIcon={<ArrowForwardIos sx={{ fontSize: "1rem" }} />}>
						<Typography>Learn more</Typography>
					</Button>
				</Link>
			</Box>
			<HeroVideoPlayer />
		</Box>
	);
}
