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
		maxWidth: "1280px"
	}
};

export default function AboutSection() {
	return (
		<Box component={"section"} sx={styles.main}>
			<Title>About</Title>
			<Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "1rem" }}>
				<Wrapper variant='animated' fullWidth sx={{ gridColumn: "span 6 / span 6" }}>
					<Box
						sx={{
							width: "100%",
							height: { sm: "20rem", xs: "25rem" },
							display: "flex",
							flexDirection: { sm: "row", xs: "column" },
							alignItems: "center",
							justifyContent: "space-between",
							background: "var(--background-gradient)"
						}}
					>
						<Box sx={{ width: "100%", zIndex: 2 }}>
							<Box
								component={"article"}
								sx={{
									padding: { md: "2rem 6rem", sm: "2rem", xs: "2rem" },
									"& *": { textWrap: "balance" },
									display: "flex",
									flexDirection: "column",
									gap: "1rem"
								}}
							>
								<Typography
									variant='h3'
									sx={{ whiteSpace: "pre", fontSize: { sm: "2.5rem", xs: "2rem" } }}
								>{`All you need\nin one plug-in`}</Typography>
								<Typography variant='body2'>
									{`It is a long established fact that a reader will be distracted\nby the readable content of a page when looking at its layout.`}
								</Typography>
							</Box>
						</Box>
						<Box
							sx={{
								position: "relative",
								width: "100%",
								height: "100%",
								"& img": {
									width: "100%",
									height: "auto",
									objectFit: "cover",
									transform: {
										lg: "rotate(10deg) translate(0, -20%) scale(1.2)",
										md: "rotate(10deg) translate(0, -10%) scale(1.4)",
										xs: "rotate(10deg) translate(15%, 0%) scale(1.5)"
									},
									position: "relative"
								},
								"&::before": {
									content: '""',
									position: "absolute",
									display: { md: "none", xs: "block" },
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									background: "linear-gradient(to bottom, var(--background) 10%, transparent 50%)",
									zIndex: 1,
									transform: {
										md: "rotate(10deg) translate(0, -20%) scale(1.2)",
										xs: "rotate(10deg) translate(15%, 0%) scale(1.5)"
									}
								}
							}}
						>
							<Image src={"/images/cep.png"} alt='about dashboard' width={904} height={966} />
						</Box>
					</Box>
				</Wrapper>
				<Wrapper
					variant='animated'
					angleOffset={90}
					fullWidth
					sx={{ gridColumn: { sm: "span 3 / span 3", xs: "span 6 / span 6" } }}
				>
					<Box
						sx={{
							width: "100%",
							height: "20rem",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "1rem",
							justifyContent: "flex-end",
							background: "var(--background-gradient)",
							padding: "2rem 4rem",
							position: "relative"
						}}
					>
						<Box
							sx={{
								width: "100%",
								height: "100%",
								backgroundImage: "url(/images/about.png)",
								backgroundSize: { lg: "120%", md: "150%", xs: "160%" },
								backgroundPositionX: { lg: "48%", md: "50%", xs: "48%" },
								backgroundPositionY: { lg: "-180px", md: "-160px", xs: "-126px" },
								backgroundRepeat: "no-repeat",
								position: "absolute",
								top: 0,
								left: 0
							}}
						/>
						<Box
							component={"article"}
							sx={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}
						>
							<Typography
								variant='h3'
								sx={{ whiteSpace: "pre", fontSize: { md: "2rem", sm: "1.5rem", xs: "1.5rem" } }}
							>{`Updates every month`}</Typography>
							<Typography
								variant='body2'
								sx={{ textAlign: "center", textWrap: "balance", fontSize: { lg: "1rem", sm: "0.8rem", xs: "0.8rem" } }}
							>
								{`It is a long established fact that a reader will be distracted\nby the readable content of a page when looking at its layout`}
							</Typography>
						</Box>
					</Box>
				</Wrapper>
				<Wrapper
					variant='animated'
					angleOffset={180}
					fullWidth
					sx={{ gridColumn: { sm: "span 3 / span 3", xs: "span 6 / span 6" } }}
				>
					<Box
						sx={{
							width: "100%",
							height: "20rem",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "1rem",
							justifyContent: "flex-end",
							background: "var(--background-gradient)",
							padding: "2rem 4rem",
							position: "relative"
						}}
					>
						<Box
							sx={{
								width: "100%",
								height: "100%",
								backgroundImage: "url(/images/aepr.png)",
								backgroundSize: { lg: "120%", md: "150%", xs: "180%" },
								backgroundPositionX: { lg: "48%", md: "50%", xs: "48%" },
								backgroundPositionY: { lg: "-150px", md: "-140px", xs: "-125px" },
								backgroundRepeat: "no-repeat",
								position: "absolute",
								top: 0,
								left: 0
							}}
						/>
						<Box
							component={"article"}
							sx={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}
						>
							<Typography
								variant='h3'
								sx={{ whiteSpace: "pre", fontSize: { md: "2rem", sm: "1.5rem", xs: "1.5rem" } }}
							>{`Suitable for both software`}</Typography>
							<Typography
								variant='body2'
								sx={{ textAlign: "center", textWrap: "balance", fontSize: { lg: "1rem", sm: "0.8rem", xs: "0.8rem" } }}
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
