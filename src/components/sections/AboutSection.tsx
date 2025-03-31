import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { Wrapper } from "../layout/Wrapper";
import Title from "../ui/Title";

const styles = {
	main: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "column",
		gap: "1rem",
		maxWidth: "1200px",
		py: "4rem"
	},
	h2: {
		textAlign: "center",
		fontWeight: 400,
		fontSize: { xl: "4rem", md: "3rem", xs: "2.5rem" },
		mb: "1rem"
	},
	gridContainer: {
		display: "grid",
		gridTemplateColumns: { sm: "1fr 1fr", xs: "1fr" },
		gap: "1rem",
		width: "100%"
	},
	topFrameStyle: {
		background: "var(--background-gradient)",
		padding: { xl: "2rem 4rem", md: "2rem", xs: "1.5rem" },
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: { sm: "row", xs: "column" },
		width: "100%",
		"& article": {
			display: "flex",
			flexDirection: "column",
			gap: { xl: "1.5rem", md: "1rem", xs: "0.75rem" },
			alignItems: { md: "flex-start", xs: "center" },
			textAlign: { md: "start", xs: "center" }
		},
		"& img": {
			mt: { sm: "none", xs: "1rem" },
			width: { xl: "300px", md: "300px", sm: "250px", xs: "200px" },
			height: "auto",
			maxWidth: { sm: "100%", xs: "90%" },
			aspectRatio: 1
		}
	},
	bottomFrameStyle: {
		background: "var(--background-gradient)",
		padding: { xl: "2rem 4rem", md: "2rem", xs: "1.5rem" },
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "space-between",
		gap: "1rem",
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
			width: { xl: "300px", md: "300px", sm: "250px", xs: "90%" },
			maxWidth: "100%",
			height: "auto"
		}
	}
};

export default function AboutSection() {
	return (
		<Box component={"section"} sx={styles.main}>
			<Title>About</Title>
			{/* <Typography variant='h2' sx={styles.h2}>
				About
			</Typography> */}
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
							flexDirection: "column"
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
