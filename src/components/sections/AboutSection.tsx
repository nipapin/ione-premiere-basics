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
							height: { sm: "20rem", height: "auto" },
							display: "flex",
							flexDirection: { sm: "row", xs: "column" },
							alignItems: "center",
							justifyContent: "space-between",
							background: "var(--background-gradient)"
						}}
					>
						<Box sx={{ width: "100%" }}>
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
						<Box sx={{ width: "100%", height: "100%" }}>
							<Box
								sx={{
									height: "100%",
									"& img": { height: "100%", maxWidth: "100%", objectFit: "cover" },
									position: "relative"
								}}
							>
								<Box
									sx={{
										display: { sm: "none", xs: "block" },
										position: "absolute",
										top: -1,
										left: 0,
										width: "100%",
										height: "100%",
										background: "linear-gradient(to bottom, var(--background), transparent)"
									}}
								/>
								<Image
									src={
										"https://lzsyykhroxoqmjgoxhrs.supabase.co/storage/v1/object/public/odin-pro-media//about-image-1.webp"
									}
									alt='about dashboard'
									width={1168}
									height={824}
									loading='lazy'
								/>
							</Box>
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
							justifyContent: "space-between",
							background: "var(--background-gradient)",
							padding: "2rem 4rem",
							"& img": {
								height: "auto",
								maxWidth: "100%",
								aspectRatio: "16/9",
								mt: { md: "-85px", xs: "-33px" },
								transform: { md: "scale(1.4)", xs: "scale(2.2)" }
							}
						}}
					>
						<Image src={"/images/about.png"} alt='about dashboard' width={1920} height={1080} />
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
							justifyContent: "space-between",
							background: "var(--background-gradient)",
							padding: "2rem 4rem",
							"& img": { height: "100%", maxWidth: "100%", objectFit: "contain" }
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
