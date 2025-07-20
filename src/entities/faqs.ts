export type FAQ = {
	id: number;
	title: string;
	description: string;
};

export const faqs: FAQ[] = [
	{
		id: 1,
		title: "What services do you offer?",
		description:
			"We offer a powerful extension for Adobe Premiere Pro and After Effects that includes 800+ professional elements: transitions, titles, animations, sound effects, and more — all customizable and easy to use"
	},
	{
		id: 2,
		title: "Do you offer customer support?",
		description:
			"Absolutely. Our support team is here to help with any questions or technical issues. Reach out anytime via Contact Us form"
	},
	{
		id: 3,
		title: "Will I get new content after purchase?",
		description:
			"Absolutely. With a Creator Plan or Lifetime license, you’ll receive regular monthly content updates at no extra cost"
	},
	{
		id: 4,
		title: "Can I use it for commercial projects?",
		description:
			"Yes — all paid plans include a full commercial license. Use it for client work, YouTube videos, ads, or anything else"
	},
	{
		id: 5,
		title: "Can I install it on more than one computer?",
		description: "Yes — you can use it on two devices at the same time, as long as they belong to the same user account"
	},
	{
		id: 6,
		title: "Is there a refund policy?",
		description:
			"We offer a 7-day free trial so you can test everything before purchasing. If you experience any technical issues, our team will help or issue a refund based on the situation."
	},
	{
		id: 7,
		title: "Does it work on both Mac and Windows?",
		description: "Yes! The plugin is fully compatible with both macOS and Windows operating systems."
	},
	{
		id: 8,
		title: "Do I need both Premiere Pro and After Effects to use it?",
		description:
			"No, you can use the plugin with either one. However, if you use both apps, the extension works seamlessly across both — using the same library and interface."
	}
];
