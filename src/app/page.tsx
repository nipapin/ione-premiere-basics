import AboutSection from "@/components/sections/AboutSection";
import BlogSection from "@/components/sections/BlogSection";
import EditingSolutions from "@/components/sections/EditingSolutionsSection";
import FAQSection from "@/components/sections/FAQSection";
import Hero from "@/components/sections/HeroSection";
import PartnersShowcase from "@/components/sections/PartnersShowcaseSection";
import PeopleCommentsSection from "@/components/sections/PeopleCommentsSection";
import PlansSection from "@/components/sections/PlansSecrtion";
import PowerfulTools from "@/components/sections/PowerfulToolsSection";
import Showcase from "@/components/sections/ShowcaseSection";
import StatisticShowcase from "@/components/sections/StatisticShowcaseSection";
import SuitsSection from "@/components/sections/SuitsSection";
import TeamSection from "@/components/sections/TeamSection";
import { Box } from "@mui/material";
import Stack from "@mui/material/Stack";

export default function Home() {
	return (
		<Box
			sx={{ display: "flex", flexDirection: "column", gap: { xl: "4rem", sm: "3rem", xs: "2rem" } }}
			px={{ xl: 0, md: "2rem", xs: "1rem" }}
			mx={"auto"}
			maxWidth={"xl"}
			width={"100%"}
			alignItems={"center"}
		>
			<Hero />
			<PartnersShowcase />
			<AboutSection />
			<StatisticShowcase />
			<PowerfulTools />
			<Showcase />
			<EditingSolutions />
			<SuitsSection />
			<PlansSection />
			<FAQSection />
			<PeopleCommentsSection />
			<BlogSection />
			<TeamSection />
		</Box>
	);
}
