import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { Wrapper } from "../layout/Wrapper";

const styles = {
	main: {
		width: "100%",
		minHeight: "75vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "column",
		maxWidth: { xl: "100%", md: "90%", xs: "100%" },
		mx: { xl: 0, md: "auto", xs: 0 },
		gap: { xl: "2rem", md: "1.5rem", xs: "1rem" },
		py: { xl: "4rem", md: "3rem", xs: "2rem" }
	},
	gridContainer: {
		display: "grid",
		gridTemplateColumns: { xl: "1fr 1fr", md: "1fr" },
		gap: { xl: "2rem", md: "1.5rem", xs: "1rem" },
		width: "100%",
		maxWidth: { xl: "70vw", md: "85vw", xs: "100%" }
	},

	topFrameStyle: {
		background: "var(--background-gradient)",
		padding: { xl: "2rem 8rem", md: "2rem 4rem", xs: "1.5rem" },
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: { md: "row", sm: "row", xs: "column" },
		width: "100%",
		gap: { xl: "4rem", md: "2rem", xs: "1.5rem" },
		"& article": {
			display: "flex",
			flexDirection: "column",
			gap: { xl: "1.5rem", md: "1rem", xs: "0.75rem" },
			alignItems: { md: "flex-start", xs: "center" },
			textAlign: { md: "start", xs: "center" }
		},
		"& img": {
			width: { xl: "400px", md: "300px", sm: "250px", xs: "90%" },
			height: "auto",
			maxWidth: "100%"
		}
	},
	bottomFrameStyle: {
		background: "var(--background-gradient)",
		padding: { xl: "2rem 4rem", md: "2rem 3rem", xs: "1.5rem" },
		display: "flex",
		flexDirection: { xl: "column", md: "row", sm: "row", xs: "column" },
		alignItems: "center",
		justifyContent: "space-between",
		gap: { xl: "2rem", md: "1.5rem", xs: "1rem" },
		width: "100%",
		textAlign: "center",
		"& article": {
			display: "flex",
			flexDirection: "column",
			gap: { xl: "1.5rem", md: "1rem", xs: "0.75rem" },
			alignItems: { xl: "center", md: "flex-start", xs: "center" },
			textAlign: { xl: "center", md: "start", xs: "center" }
		},
		"& img": {
			width: { xl: "350px", md: "300px", sm: "250px", xs: "90%" },
			maxWidth: "100%",
			height: "auto"
		}
	}
};

export default function AboutSection() {
	return (
		<Box component={"section"} sx={styles.main}>
			<Typography
				variant='h2'
				textAlign={"center"}
				fontWeight={400}
				fontSize={{ xl: "3.5rem", md: "3rem", xs: "2.5rem" }}
				mb={{ xl: "2rem", md: "1.5rem", xs: "1rem" }}
			>
				About
			</Typography>
			<Box sx={styles.gridContainer}>
				<Wrapper variant='animated' sx={{ gridColumn: "1 / -1", width: "100%" }}>
					<Box sx={styles.topFrameStyle}>
						<Box component={"article"}>
							<Typography fontSize={{ xl: "3rem", xs: "2.5rem" }} whiteSpace={"pre"}>
								{`All you need in\none plug-in`}
							</Typography>
							<Typography whiteSpace={"pre"} fontSize={{ xl: "1rem", xs: "0.8rem" }} fontWeight={200}>
								{`It is a long established fact that a reader will be distracted\nby the readable content of a page when looking at its layout.`}
							</Typography>
						</Box>
						<Image
							src={
								"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/features/dashboard.png"
							}
							alt='about dashboard'
							width={344}
							height={327}
						/>
					</Box>
				</Wrapper>
				<Wrapper variant='animated' angleOffset={90} sx={{ width: "100%" }}>
					<Box sx={styles.bottomFrameStyle}>
						<Image
							src={
								"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/features/cards.png"
							}
							alt='about dashboard'
							width={344}
							height={327}
						/>
						<Box component={"article"}>
							<Typography fontSize={{ xl: "2rem", xs: "1.5rem" }} whiteSpace={"pre"}>
								{`Updates every month`}
							</Typography>
							<Typography whiteSpace={"pre"} fontSize={{ xl: "1rem", xs: "0.8rem" }} fontWeight={200}>
								{`It is a long established fact that a reader will be distracted\nby the readable content of a page when looking at its layout`}
							</Typography>
						</Box>
					</Box>
				</Wrapper>
				<Wrapper variant='animated' angleOffset={180} sx={{ width: "100%" }}>
					<Box
						sx={{
							...styles.bottomFrameStyle,
							flexDirection: { xl: "column", md: "row-reverse", sm: "row-reverse", xs: "column" }
						}}
					>
						<Image
							src={
								"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/features/cards.png"
							}
							alt='about dashboard'
							width={344}
							height={327}
						/>
						<Box component={"article"}>
							<Typography fontSize={{ xl: "2rem", xs: "1.5rem" }} whiteSpace={"pre"}>
								{`Suitable for both software`}
							</Typography>
							<Typography whiteSpace={"pre"} fontSize={{ xl: "1rem", xs: "0.8rem" }} fontWeight={200}>
								{`It is a long established fact that a reader will be distracted\nby the readable content of a page when looking at its layout`}
							</Typography>
						</Box>
					</Box>
				</Wrapper>
			</Box>
		</Box>
	);
}
