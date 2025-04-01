import PageContainer from "@/components/layout/PageContainer";
import AboutSection from "@/components/sections/AboutSection";
import EditingSolutions from "@/components/sections/EditingSolutionsSection";
import PowerfulTools from "@/components/sections/PowerfulToolsSection";
import Showcase from "@/components/sections/ShowcaseSection";
import StatisticShowcase from "@/components/sections/StatisticShowcaseSection";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Premiere Basics | Features",
	description: "Features of Premiere Basics",
};

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
