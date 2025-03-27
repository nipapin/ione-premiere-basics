import FAQSection from "@/components/sections/FAQSection";
import PeopleCommentsSection from "@/components/sections/PeopleCommentsSection";
import PlansSection from "@/components/sections/PlansSecrtion";
import Stack from "@mui/material/Stack";

export default function Home() {
	return (
		<Stack
			direction={"column"}
			spacing={{ xl: "4rem", md: "3rem", xs: "2rem" }}
			px={{ xl: 0, md: "2rem", xs: "1rem" }}
			mx={"auto"}
			maxWidth={"xl"}
			width={"100%"}
			alignItems={"center"}
		>
			<PlansSection />
			<FAQSection />
			<PeopleCommentsSection />
		</Stack>
	);
}
