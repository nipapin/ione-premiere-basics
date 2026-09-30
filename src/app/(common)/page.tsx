"use server";

import { getBlogs } from "@/actions/blog";
import { setCookies } from "@/actions/setCookies";
import AffiliateSystem from "@/components/AffiliateSystem";
import PageContainer from "@/components/layout/PageContainer";
import AboutSection from "@/components/sections/AboutSection";
import BlogSection from "@/components/sections/BlogSection";
import EditingSolutions from "@/components/sections/EditingSolutionsSection";
import FAQSection from "@/components/sections/FAQSection";
import Hero from "@/components/sections/HeroSection";
import PartnersShowcase from "@/components/sections/PartnersShowcaseSection";
import PeopleCommentsSection from "@/components/sections/PeopleCommentsSection";
import PlansSection from "@/components/sections/PlansSection";
import PowerfulTools from "@/components/sections/PowerfulToolsSection";
import Showcase from "@/components/sections/ShowcaseSection";
import StatisticShowcase from "@/components/sections/StatisticShowcaseSection";
import SuitsSection from "@/components/sections/SuitsSection";
import TeamSection from "@/components/sections/TeamSection";
import { CepLogin } from "@/components/forms/CepLogin";
import { cepReturnPath } from "@/lib/cep-return";
import { validateSession } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
	const params = await searchParams;
	const cepTarget = params.cep ? cepReturnPath(`/?cep=${encodeURIComponent(params.cep)}`) : undefined;
	const cepCode = cepTarget ? new URL(cepTarget, "https://odin-pro.com").searchParams.get("cep") : null;
	if (cepTarget && !(await validateSession())) redirect(`/login?next=${encodeURIComponent(cepTarget)}`);
	const affiliate = params.ref;
	const affiliateExists = !!(await cookies()).get("odin-pro-affiliate")?.value;

	// const blogs = await getBlogs(undefined, 3);
	return (
		<PageContainer>
			{cepCode ? <CepLogin code={cepCode} /> : null}
			{!affiliateExists && <AffiliateSystem affiliate={affiliate} />}
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
			{/* <BlogSection blogs={blogs} /> */}
			<TeamSection />
		</PageContainer>
	);
}
