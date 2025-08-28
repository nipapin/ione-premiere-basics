"use client";

import { useUser } from "@/contexts/UserWrapper";
import { ArrowForwardIos } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import HeroVideoPlayer from "../media/HeroVideoPlayer";
import StyledLink from "../ui/StyledLink";

const styles = {
	hero: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: "1rem",
		pt: "2.5rem"
	},
	accentChip: {
		border: "1px solid var(--primary)",
		width: "fit-content",
		p: "1rem",
		mb: "1.5rem",
		borderRadius: "999px",
		background: "var(--primary-glass)",
		"& *": {
			fontSize: { xl: "1rem", md: "0.9rem", sm: "0.85rem", xs: "0.75rem" },
			fontWeight: 200
		}
	},
	h1: {
		fontSize: { xl: "4rem", md: "3rem", sm: "3rem", xs: "1.9rem" },
		whiteSpace: "pre",
		textAlign: "center",
		fontWeight: 400
	},
	tagline: {
		whiteSpace: "pre",
		textAlign: "center",
		fontSize: { xl: "1.25rem", md: "1.1rem", sm: "1rem", xs: "0.9rem" },
		fontWeight: 200,
		lineHeight: "1.5"
	},
	buttons: {
		display: "flex",
		my: "2rem",
		flexDirection: "row",
		width: { xs: "100%", sm: "auto" },
		gap: "1rem",
		"& .MuiButton-root": {
			width: { xs: "100%", sm: "auto" },
			mb: { xs: 1, sm: 0 }
		}
	}
};

export default function Hero() {
	const user = useUser();
	return (
		<Box component={"section"} sx={styles.hero}>
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
			<Typography variant='h1' sx={styles.h1}>{`One extension to rule your\nentire editing process`}</Typography>
			<Typography
				sx={{ ...styles.tagline, textWrap: "balance", whiteSpace: { sm: "pre", xs: "discard" } }}
			>{`Boost your workflow with high-performance assets and automation\nright inside Premiere Pro & After Effects.`}</Typography>
			<Box sx={{ ...styles.buttons }}>
				<Link href={user ? "/download" : "/login"} passHref legacyBehavior>
					<Button variant='contained' href=''>
						<Typography fontWeight={500}>Get started</Typography>
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
