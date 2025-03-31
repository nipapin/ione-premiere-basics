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
		name: "Wade Warren",
		bio: "CEO, Since Industry",
		avatar:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/testimonials/avatar-small.png",
		quote:
			"GTIS Partners is a leading real estate investment firm in the Americas, headquartered in New York with offices in São Paulo, San Francisco, Los Angeles, Atlanta, Charlotte, Phoenix"
	},
	{
		id: 2,
		name: "Wade Warren",
		bio: "CEO, Since Industry",
		avatar:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/testimonials/avatar-small.png",
		quote:
			"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly"
	},
	{
		id: 3,
		name: "Wade Warren",
		bio: "CEO, Since Industry",
		avatar:
			"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/testimonials/avatar-small.png",
		quote:
			"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 5 BC, making it over 2000 years"
	}
];
