import { LocalMovies, Palette, Person, School, Videocam, YouTube } from "@mui/icons-material";
import { ReactNode } from "react";

type Suit = {
	id: number;
	title: string;
	description: string;
	icon: ReactNode;
};

export const suits: Suit[] = [
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
		description: "Perfect for marketers and advertisers who need to produce creative video content for social media, ads, and presentations quickly",
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
