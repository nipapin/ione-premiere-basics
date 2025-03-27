import AboutSection from "@/components/sections/AboutSection";
import EditingSolutions from "@/components/sections/EditingSolutionsSection";
import PowerfulTools from "@/components/sections/PowerfulToolsSection";
import Showcase from "@/components/sections/ShowcaseSection";
import StatisticShowcase from "@/components/sections/StatisticShowcaseSection";
import Stack from "@mui/material/Stack";

export default function Features() {
	return (
		<Stack
			direction={"column"}
			spacing={{ xl: "4rem", md: "3rem", xs: "2rem" }}
			px={{ xl: 0, md: "2rem", xs: "1rem" }}
			mx={"auto"}
			maxWidth={"xl"}
			width={"100%"}
			alignItems={"center"}
		>
			<AboutSection />
			<StatisticShowcase />
			<PowerfulTools />
			<Showcase />
			<EditingSolutions />
		</Stack>
	);
}
