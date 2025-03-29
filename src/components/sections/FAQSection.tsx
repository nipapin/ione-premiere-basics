import { Typography } from "@mui/material";
import { Wrapper } from "../layout/Wrapper";
import FAQItem from "../ui/FAQItem";

export type FAQ = {
	id: number;
	title: string;
	description: string;
};

const faqs: FAQ[] = [
	{
		id: 1,
		title: "What services do you offer?",
		description:
			"We offer comprehensive editing solutions including core engagement surveys, topic-based assessments, and analytics tools to help improve your content."
	},
	{
		id: 2,
		title: "How much does it cost?",
		description:
			"We have flexible pricing plans starting from $11/month for basic features up to $250 for lifetime access to all premium features."
	},
	{
		id: 3,
		title: "Is there a free trial available?",
		description:
			"Yes, you can try our basic features for free for 14 days to evaluate if our service meets your needs."
	},
	{
		id: 4,
		title: "How do I get started?",
		description:
			"Simply choose a plan that fits your needs and click 'Start Now' to begin. Our onboarding process will guide you through the setup."
	},
	{
		id: 5,
		title: "Do you offer customer support?",
		description:
			"Yes, we provide 24/7 customer support through email and live chat for all our paid plans."
	},
	{
		id: 6,
		title: "Can I upgrade or downgrade my plan?",
		description:
			"Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle."
	},
	{
		id: 7,
		title: "What payment methods do you accept?",
		description:
			"We accept all major credit cards, PayPal, and bank transfers for business accounts."
	},
	{
		id: 8,
		title: "Is my data secure?",
		description:
			"Yes, we use industry-standard encryption and security measures to protect your data and ensure privacy."
	}
];

export default function FAQSection() {
	return (
		<Wrapper
			component={"section"}
			display='flex'
			flexDirection={"column"}
			gap={2}
			alignItems={"center"}
			py={"4rem"}
			sx={{ maxWidth: { xl: "70vw", md: "none" } }}
		>
			<Typography fontSize='4rem' fontWeight={400} mb={"2rem"}>
				FAQ
			</Typography>
			<Wrapper
				display='grid'
				gridTemplateColumns={{ xl: "1fr 1fr", xs: "1fr" }}
				gap={2}
			>
				{faqs.map((faq) => {
					return <FAQItem key={faq.id} faq={faq} />;
				})}
			</Wrapper>
		</Wrapper>
	);
}
