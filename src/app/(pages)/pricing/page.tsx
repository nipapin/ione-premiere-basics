import PageContainer from "@/components/layout/PageContainer";
import FAQSection from "@/components/sections/FAQSection";
import PeopleCommentsSection from "@/components/sections/PeopleCommentsSection";
import PlansSection from "@/components/sections/PlansSecrtion";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Premiere Basics | Pricing",
	description: "Get our extension Odin Pro now!",
};

export default function PricingPage() {
	return (
		<PageContainer>
			<PlansSection />
			<FAQSection />
			<PeopleCommentsSection />
		</PageContainer>
	);
}
