import PageContainer from "@/components/layout/PageContainer";
import Title from "@/components/ui/Title";
import { getShowcaseTree } from "@/lib/showcase/tree";
import { Box, Divider, Typography } from "@mui/material";
import { Metadata } from "next";
import ShowcaseNavigation from "./showcase-navigation";

export const metadata: Metadata = {
	title: "Showcase",
	description: "Showcase"
};

export default function ShowcasePage() {
	const tree = getShowcaseTree();

	return (
		<PageContainer>
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
				<Title>Showcase</Title>
				<Typography>Here are some of the projects</Typography>
			</Box>
			<Divider flexItem />
			<ShowcaseNavigation tree={tree} />
		</PageContainer>
	);
}
