import { JSX } from "react";
import { ContactIcon, DiscordIcon, GettingStartedIcon, LicencesIcon, TroubeshootingIcon } from "./icons";

type LinkItem = {
	id: number;
	icon: JSX.Element;
	title: string;
	description: string;
	route: string;
	span: number;
	direction: "column" | "row";
	descriptionProps?: {
		sx: {
			textAlign: CanvasTextAlign;
		};
	};
};

export const links: LinkItem[] = [
	{
		id: 1,
		title: "Getting Started",
		description:
			"A step-by-step guide to help you quickly install and set up the extension. Learn how to activate all features and get started within minutes.",
		icon: GettingStartedIcon,
		span: 2,
		direction: "column",
		route: "/help/getting-started"
	},
	{
		id: 2,
		title: "Troubleshooting",
		description:
			"Facing an issue? Here you’ll find answers to common problems and practical tips to fix them, so you can get back to editing without delays.",
		icon: TroubeshootingIcon,
		span: 2,
		direction: "column",
		route: "/help/troubleshooting"
	},
	{
		id: 3,
		title: "Licenses & Purchases",
		description:
			"Everything you need to know about licenses, payments, and subscription renewals. Learn how to activate your product, upgrade your plan, or resolve purchase issues.",
		icon: LicencesIcon,
		span: 2,
		direction: "column",
		route: "/help/licenses-and-purchases"
	},
	{
		id: 4,
		title: "Contact Us",
		description:
			"Need help or still have questions? Our support team is ready to assist you—reach out through your preferred contact method.",
		descriptionProps: {
			sx: {
				textAlign: "start"
			}
		},
		icon: ContactIcon,
		span: 3,
		direction: "row",
		route: "/contact"
	},
	{
		id: 5,
		title: "Join our Discord",
		description:
			"Join our Discord community! Connect with other users, share experiences, ask questions, and stay up to date with the latest product news.",
		descriptionProps: {
			sx: {
				textAlign: "start"
			}
		},
		icon: DiscordIcon,
		span: 3,
		direction: "row",
		route: "https://discord.com"
	}
];
