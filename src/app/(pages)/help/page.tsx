import PageContainer from "@/components/layout/PageContainer";
import { Wrapper } from "@/components/layout/Wrapper";
import Title from "@/components/ui/Title";
import { links } from "@/entities/links";
import { Box, CardActionArea, Container, Stack, Typography } from "@mui/material";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Premiere Basics | Help",
	description: "Get help with Premiere Basics"
};

export default async function HelpPage() {
	return (
		<Container maxWidth='xl'>
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
				<Title variant='h1'>How we can help you?</Title>
				<Typography
					textAlign={"center"}
					fontWeight={200}
					fontSize='1rem'
					sx={{ textAlign: "center", fontWeight: "fontWeightLight" }}
				>
					{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt aliqua`}
				</Typography>
			</Box>
			<Wrapper
				display={"grid"}
				gridTemplateColumns={{ md: "repeat(6, 1fr)", xs: "1fr" }}
				gridTemplateRows={"1fr 1fr"}
				gap={"1rem"}
				maxWidth={"1280px"}
			>
				{links.map((linkItem) => {
					return (
						<Wrapper
							key={linkItem.id}
							variant='animated'
							angleOffset={linkItem.id * 90}
							sx={{ gridColumn: { md: `span ${linkItem.span}`, xs: "span 1" } }}
							fullWidth
						>
							<Link href={linkItem.route} passHref legacyBehavior>
								<CardActionArea>
									<Box
										sx={{
											background: "var(--background-gradient)",
											p: "2rem",
											display: "flex",
											flexDirection: { md: linkItem.direction, xs: "column" },
											alignItems: "center",
											height: "100%"
										}}
									>
										{linkItem.icon}
										<Stack
											alignItems={{
												md: linkItem.direction === "column" ? "center" : "flex-start",
												xs: "center"
											}}
											marginLeft={{
												md: linkItem.direction === "column" ? "" : "1rem",
												xs: ""
											}}
										>
											<Typography fontSize={{ xl: "2rem", md: "1.5rem" }} gutterBottom marginTop={"1rem"}>
												{linkItem.title}
											</Typography>
											<Typography fontWeight={200} textAlign={"center"} fontSize={{ xl: "1rem", md: "0.865rem" }}>
												{linkItem.description}
											</Typography>
										</Stack>
									</Box>
								</CardActionArea>
							</Link>
						</Wrapper>
					);
				})}
			</Wrapper>
		</Container>
	);
}
