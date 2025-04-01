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
};

export const links: LinkItem[] = [
	{
		id: 1,
		title: "Getting Started",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt aliqua",
		icon: GettingStartedIcon,
		span: 2,
		direction: "column",
		route: "/help/getting-started",
	},
	{
		id: 2,
		title: "Troubleshooting",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt aliqua",
		icon: TroubeshootingIcon,
		span: 2,
		direction: "column",
		route: "/help/troubleshooting",
	},
	{
		id: 3,
		title: "Licenses & Purchases",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt aliqua",
		icon: LicencesIcon,
		span: 2,
		direction: "column",
		route: "/help/licenses-and-purchases",
	},
	{
		id: 4,
		title: "Contact Us",
		description: "Lorem ipsum dolor sit amet, consectetur",
		icon: ContactIcon,
		span: 3,
		direction: "row",
		route: "/help/contact",
	},
	{
		id: 5,
		title: "Join our Discord",
		description: "Lorem ipsum dolor sit amet, consectetur",
		icon: DiscordIcon,
		span: 3,
		direction: "row",
		route: "https://discord.com",
	},
];
