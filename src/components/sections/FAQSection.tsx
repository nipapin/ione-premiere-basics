import { faqs } from "@/entities/faqs";
import { Box } from "@mui/material";
import FAQItem from "../ui/FAQItem";
import Title from "../ui/Title";

export default function FAQSection() {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", maxWidth: "1280px", py: "4rem" }} component={"section"}>
			<Title>Frequently Asked Questions</Title>
			<Box sx={{ display: "grid", gridTemplateColumns: { xl: "1fr 1fr", xs: "1fr" }, gap: "1rem", width: "100%" }}>
				{faqs.map((faq) => {
					return <FAQItem key={faq.id} faq={faq} />;
				})}
			</Box>
		</Box>
	);
}
