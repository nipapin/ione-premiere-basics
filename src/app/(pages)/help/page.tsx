import { Wrapper } from "@/components/layout/Wrapper";
import { Box, CardActionArea, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { JSX } from "react";
import { ContactIcon, DiscordIcon, GettingStartedIcon, LicencesIcon, TroubeshootingIcon } from "./icons";

type LinkItem = {
	id: number;
	icon: JSX.Element;
	title: string;
	description: string;
	route: string;
	span: number;
	direction: "column" | "row";
};

const links: LinkItem[] = [
	{
		id: 1,
		title: "Getting Started",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt aliqua",
		icon: GettingStartedIcon,
		span: 2,
		direction: "column",
		route: "/help/getting-started"
	},
	{
		id: 2,
		title: "Troubleshooting",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt aliqua",
		icon: TroubeshootingIcon,
		span: 2,
		direction: "column",
		route: "/help/troubleshooting"
	},
	{
		id: 3,
		title: "Licenses & Purchases",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt aliqua",
		icon: LicencesIcon,
		span: 2,
		direction: "column",
		route: "/help/licenses-and-purchases"
	},
	{
		id: 4,
		title: "Contact Us",
		description: "Lorem ipsum dolor sit amet, consectetur",
		icon: ContactIcon,
		span: 3,
		direction: "row",
		route: "/help/contact"
	},
	{
		id: 5,
		title: "Join our Discord",
		description: "Lorem ipsum dolor sit amet, consectetur",
		icon: DiscordIcon,
		span: 3,
		direction: "row",
		route: "https://discord.com"
	}
];

export default async function HelpPage() {
	return (
		<Stack direction={"column"} gap={2} p={"4rem 2rem"} mx={"auto"} alignItems={"center"}>
			<Typography variant='h1' fontWeight={400} fontSize={{ md: "4rem", xs: "2rem" }} textAlign={"center"}>
				How we can help you?
			</Typography>
			<Typography textAlign={"center"} fontWeight={200} fontSize={{ md: "1.5rem", xs: "1rem" }} whiteSpace={"pre"} mb={"2rem"}>
				{`Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt aliqua`}
			</Typography>
			<Wrapper display={"grid"} gridTemplateColumns={{ md: "repeat(6, 1fr)", xs: "1fr" }} gridTemplateRows={"1fr 1fr"} gap={"2rem"}>
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
												md: linkItem.direction === "column" ? "center" : "",
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
		</Stack>
	);
}
