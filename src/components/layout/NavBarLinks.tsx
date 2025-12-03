"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import StyledLink from "../ui/StyledLink";
import { usePathname } from "next/navigation";

export type NavItem = {
	id: number;
	label: string;
	href: string;
};

export const navItems: NavItem[] = [
	{ id: 1, label: "Home", href: "/" },
	{ id: 2, label: "Features", href: "/features" },
	{ id: 3, label: "Pricing", href: "/pricing" },
	{ id: 4, label: "Download", href: "/download" },
	// { id: 5, label: "Blog", href: "/blog" },
	{ id: 6, label: "Help", href: "/help" },
];

export default function NavBarLinks() {
	const pathname = usePathname();
	return (
		<Stack direction={"row"} spacing={4} sx={{ display: { xs: "none", xl: "flex" } }}>
			{navItems.map((item) => {
				return (
					<StyledLink key={item.id} href={item.href} active={item.href === pathname}>
						<Typography fontWeight={"inherit"} textAlign={"center"}>
							{item.label}
						</Typography>
					</StyledLink>
				);
			})}
		</Stack>
	);
}
