type Comment = {
	id: number;
	name: string;
	bio: string;
	quote: string;
	avatar: string;
};

export const comments: Comment[] = [
	{
		id: 1,
		name: "Content Creator",
		bio: "",
		avatar:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/testimonials/avatar-small.png",
		quote:
			"As a full-time YouTube creator, I’m constantly looking for ways to speed up my editing without sacrificing quality.\nThis extension has completely changed how I work — from animated titles and transitions to social media overlays, everything is just one click away.\nI’ve cut my editing time by at least 60%, and my videos now look more polished and professional.\nIt’s like having a full-time motion designer in my panel."
	},
	{
		id: 2,
		name: "Freelance Editor",
		bio: "",
		avatar:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/testimonials/avatar-small.png",
		quote:
			"I work with multiple clients across different industries, and I always need to deliver high-quality edits fast.\nThis plugin gives me everything — typography, effects, UI elements — all in one place, customizable and quick to apply.\nThe duration control and autoresize features are lifesavers. I no longer waste time on manual adjustments, and clients have noticed the difference in speed and consistency."
	},
	{
		id: 3,
		name: "Creative Director",
		bio: "",
		avatar:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/testimonials/avatar-small.png",
		quote:
			"Our agency handles branded content for several tech companies.\nWe needed something that would allow us to move fast, stay on-brand, and scale production.\nThis plugin helps us do exactly that. We’ve saved dozens of hours every month, and the ability to use it seamlessly in both After Effects and Premiere has simplified our pipeline massively.\nWe even use it for pitch decks and internal sizzle reels now."
	}
];
