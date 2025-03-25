import AboutSection from "@/components/AboutSection";
import Hero from "@/components/Hero";
import PartnersShowcase from "@/components/PartnersShowcase";
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
			<Hero />
			<PartnersShowcase />
			<AboutSection />
		</Stack>
	);
}
