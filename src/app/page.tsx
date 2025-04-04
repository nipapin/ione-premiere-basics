import { getBlogs } from "@/actions/blog";
import PageContainer from "@/components/layout/PageContainer";
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

export default async function Home() {
	const blogs = await getBlogs(undefined, 3);
	return (
		<PageContainer>
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
			<BlogSection blogs={blogs} />
			<TeamSection />
		</PageContainer>
	);
}
