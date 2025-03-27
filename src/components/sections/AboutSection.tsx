import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { Wrapper } from "../layout/Wrapper";
import Image from "next/image";
import Box from "@mui/material/Box";

const styles = {
	main: {
		width: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "column",
		maxWidth: { xl: "100%", md: "90%", xs: "100%" },
		mx: { xl: 0, md: "auto", xs: 0 },
		gap: "2rem",
		py: "2rem"
	},
	gridContainer: {
		display: "grid",
		gridTemplateColumns: { xl: "1fr 1fr", md: "1fr" },
		gap: { xl: "2rem", xs: "1rem" },
		width: "100%",
		maxWidth: { xl: "70vw", xs: "100%" }
	},

	topFrameStyle: {
		background: "var(--background-gradient)",
		padding: { xl: "2rem", xs: "1rem" },
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: { md: "row", xs: "column" },
		width: "100%",
		gap: { xl: 0, xs: "2rem" },
		"& article": {
			display: "flex",
			flexDirection: "column",
			gap: "1rem",
			alignItems: { md: "flex-start", xs: "center" },
			textAlign: { md: "start", xs: "center" }
		},
		"& img": {
			width: { md: "revert-layer", xs: "90%" },
			height: "auto"
		}
	},
	bottomFrameStyle: {
		background: "var(--background-gradient)",
		padding: { xl: "2rem", xs: "1rem" },
		display: "flex",
		flexDirection: { xl: "column", md: "row", xs: "column" },
		alignItems: "center",
		justifyContent: "space-between",
		gap: "2rem",
		width: "100%",
		textAlign: "center",
		"& article": {
			display: "flex",
			flexDirection: "column",
			gap: "1rem",
			alignItems: { xl: "center", md: "flex-start", xs: "center" },
			textAlign: { xl: "center", md: "start", xs: "center" }
		},
		"& img": {
			width: { md: "revert-layer", xs: "90%" },
			height: "auto"
		}
	}
};

export default function AboutSection() {
	return (
		<Box component={"section"} sx={styles.main}>
			<Typography variant='h2' textAlign={"center"} fontWeight={400}>
				About
			</Typography>
			<Box sx={styles.gridContainer}>
				<Wrapper
					variant='animated'
					sx={{ gridColumn: "1 / -1", width: "100%" }}
				>
					<Box sx={styles.topFrameStyle}>
						<Box component={"article"}>
							<Typography
								fontSize={{ xl: "3rem", xs: "2.5rem" }}
								whiteSpace={"pre"}
							>
								{`All you need in\none plug-in`}
							</Typography>
							<Typography
								whiteSpace={"pre"}
								fontSize={{ xl: "1rem", xs: "0.8rem" }}
								fontWeight={200}
							>
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
								"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/features/dashboard.png"
							}
							alt='about dashboard'
							width={344}
							height={327}
						/>
						<Box component={"article"}>
							<Typography
								fontSize={{ xl: "3rem", xs: "1.75rem" }}
								whiteSpace={"pre"}
							>
								{`Updates every month`}
							</Typography>
							<Typography
								whiteSpace={"pre"}
								fontSize={{ xl: "1rem", xs: "0.8rem" }}
								fontWeight={200}
							>
								{`It is a long established fact that a reader will be distracted\nby the readable content of a page when looking at its layout`}
							</Typography>
						</Box>
					</Box>
				</Wrapper>
				<Wrapper variant='animated' angleOffset={180} sx={{ width: "100%" }}>
					<Box
						sx={{
							...styles.bottomFrameStyle,
							flexDirection: { xl: "column", md: "row-reverse", xs: "column" }
						}}
					>
						<Image
							src={
								"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/features/dashboard.png"
							}
							alt='about dashboard'
							width={344}
							height={327}
						/>
						<Box component={"article"}>
							<Typography
								fontSize={{ xl: "3rem", xs: "1.5rem" }}
								whiteSpace={"pre"}
							>
								{`Suitable for both software`}
							</Typography>
							<Typography
								whiteSpace={"pre"}
								fontSize={{ xl: "1rem", xs: "0.8rem" }}
								fontWeight={200}
							>
								{`It is a long established fact that a reader will be distracted\nby the readable content of a page when looking at its layout`}
							</Typography>
						</Box>
					</Box>
				</Wrapper>
			</Box>
		</Box>
	);
}
