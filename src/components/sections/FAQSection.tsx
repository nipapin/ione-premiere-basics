import { faqs } from "@/entities/faqs";
import { Box, Typography } from "@mui/material";
import FAQItem from "../ui/FAQItem";

export default function FAQSection() {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", maxWidth: "1280px", py: "4rem" }} component={"section"}>
			<Typography sx={{ fontSize: "4rem", fontWeight: 400, mb: "2rem" }}>FAQ</Typography>
			<Box sx={{ display: "grid", gridTemplateColumns: { xl: "1fr 1fr", xs: "1fr" }, gap: "1rem" }}>
				{faqs.map((faq) => {
					return <FAQItem key={faq.id} faq={faq} />;
				})}
			</Box>
		</Box>
	);
}
