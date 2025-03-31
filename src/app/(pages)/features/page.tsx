import PageContainer from "@/components/layout/PageContainer";
import AboutSection from "@/components/sections/AboutSection";
import EditingSolutions from "@/components/sections/EditingSolutionsSection";
import PowerfulTools from "@/components/sections/PowerfulToolsSection";
import Showcase from "@/components/sections/ShowcaseSection";
import StatisticShowcase from "@/components/sections/StatisticShowcaseSection";

export default function Features() {
	return (
		<PageContainer>
			<AboutSection />
			<StatisticShowcase />
			<PowerfulTools />
			<Showcase />
			<EditingSolutions />
		</PageContainer>
	);
}
