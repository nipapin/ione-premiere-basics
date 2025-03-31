import PageContainer from "@/components/layout/PageContainer";
import FAQSection from "@/components/sections/FAQSection";
import PeopleCommentsSection from "@/components/sections/PeopleCommentsSection";
import PlansSection from "@/components/sections/PlansSecrtion";

export default function PricingPage() {
	return (
		<PageContainer>
			<PlansSection />
			<FAQSection />
			<PeopleCommentsSection />
		</PageContainer>
	);
}
