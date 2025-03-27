import {
	LocalMovies,
	Palette,
	Person,
	School,
	Videocam,
	YouTube
} from "@mui/icons-material";
import { Typography } from "@mui/material";
import { ReactNode } from "react";
import { Wrapper } from "../layout/Wrapper";

type Suit = {
	id: number;
	title: string;
	description: string;
	icon: ReactNode;
};

const suits: Suit[] = [
	{
		id: 1,
		title: "Video Editors",
		description:
			"Professionals handling large volumes of video content can significantly cut down editing time with automated tools and built-in effects",
		icon: <Videocam sx={{ color: "var(--primary)" }} fontSize='large' />
	},
	{
		id: 2,
		title: "Motion Designers",
		description:
			"Creators of animations and motion graphics will benefit from ready-made effects, titles, and animations, speeding up their workflow and enhancing visual quality",
		icon: <Palette sx={{ color: "var(--primary)" }} fontSize='large' />
	},
	{
		id: 3,
		title: "Content Creators",
		description:
			"YouTubers, TikTok creators, and Instagram influencers can quickly edit engaging videos with effects and animations—without diving into complex software settings",
		icon: <YouTube sx={{ color: "var(--primary)" }} fontSize='large' />
	},
	{
		id: 4,
		title: "Production Studios",
		description:
			"Perfect for marketers and advertisers who need to produce creative video content for social media, ads, and presentations quickly",
		icon: <LocalMovies sx={{ color: "var(--primary)" }} fontSize='large' />
	},
	{
		id: 5,
		title: "Freelancers",
		description:
			"For those working on client projects, delivering high-quality results fast is essential. Odin Pro helps automate repetitive tasks and boost productivity",
		icon: <Person sx={{ color: "var(--primary)" }} fontSize='large' />
	},
	{
		id: 6,
		title: "Educators",
		description:
			"Those creating educational content can easily add professional-looking effects and animations to enhance engagement and comprehension",
		icon: <School sx={{ color: "var(--primary)" }} fontSize='large' />
	}
];

export default function SuitsSection() {
	return (
		<Wrapper
			display='flex'
			flexDirection='column'
			gap={2}
			alignItems='center'
			maxWidth={{ xl: "70vw", xs: "none" }}
			py={"4rem"}
		>
			<Typography
				variant='h2'
				fontWeight={400}
				textAlign={"center"}
				fontSize={{ xl: "4rem", xs: "2.5rem" }}
				whiteSpace={{ md: "normal", xs: "pre" }}
			>
				{`Suitable for\nall content creator's`}
			</Typography>
			<Typography fontWeight={200} mb='2rem' textAlign={"center"}>
				The plugin is ideal for absolutely all professions who want to achieve
				great results by creating attractive and effective videos.
			</Typography>
			<Wrapper
				display='grid'
				gridTemplateColumns={{ xl: "repeat(3, 1fr)", md: "1fr 1fr", xs: "1fr" }}
				gap={2}
			>
				{suits.map((suit, index) => {
					return (
						<Wrapper key={suit.id} variant='animated' angleOffset={index * 90}>
							<Wrapper
								display={"flex"}
								flexDirection={"column"}
								gap={2}
								sx={{ background: "var(--background-gradient)", p: "2rem" }}
							>
								{suit.icon}
								<Typography fontSize={"1.5rem"} fontWeight={500} mb={"2rem"}>
									{suit.title}
								</Typography>
								<Typography fontWeight={200}>{suit.description}</Typography>
							</Wrapper>
						</Wrapper>
					);
				})}
			</Wrapper>
		</Wrapper>
	);
}
