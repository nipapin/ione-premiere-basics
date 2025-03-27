"use client";

import ArrowUpward from "@mui/icons-material/ArrowUpward";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import useScrollTrigger from "@mui/material/useScrollTrigger";

export default function ScrollToTop() {
	const trigger = useScrollTrigger({ threshold: 100, disableHysteresis: true });

	const scroll = () => {
		window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
	};

	return (
		<Fade in={trigger}>
			<Button
				variant='contained'
				sx={{
					position: "fixed",
					right: { xl: "2rem", xs: "1rem" },
					bottom: { xl: "2rem", xs: "6rem" },
					aspectRatio: 1,
					p: { xs: "0.5rem" },
					zIndex: 10000
				}}
				onClick={scroll}
			>
				<ArrowUpward />
			</Button>
		</Fade>
	);
}
