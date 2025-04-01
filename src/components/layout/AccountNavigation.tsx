"use client";

import { logout } from "@/actions/user";
import { useUser } from "@/contexts/UserWrapper";
import { Box, Button, Divider, Link, List, ListItem, Skeleton, Typography } from "@mui/material";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wrapper } from "./Wrapper";

type MenuItem = {
	id: number;
	title: string;
	route: string;
};

const menuItems: MenuItem[] = [
	{
		id: 1,
		title: "Account Details",
		route: "/account",
	},
	{
		id: 2,
		title: "Subscription",
		route: "/account/subscription",
	},
	{
		id: 3,
		title: "My Devices",
		route: "/account/devices",
	},
	{
		id: 4,
		title: "Extension",
		route: "/account/extension",
	},
];

export default function AccountNavigation() {
	const pathname = usePathname();
	const router = useRouter();
	const user = useUser();

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	return (
		<Box>
			<Wrapper variant="animated">
				<Wrapper sx={{ background: "var(--background-gradient)" }} fullWidth padding={"2rem"}>
					<Typography sx={{ fontWeight: "400", fontSize: "1.5rem" }} gutterBottom>
						My Account
					</Typography>
					{user ? (
						<Typography sx={{ fontWeight: "400" }} color="primary">
							{user?.email}
						</Typography>
					) : (
						<Skeleton variant="text" width={"100%"} height={"2rem"} />
					)}
					<Divider sx={{ my: "2rem" }} />
					<List disablePadding>
						{menuItems.map((menuItem) => {
							return (
								<ListItem disableGutters disablePadding key={menuItem.id} sx={{ my: "1rem" }}>
									<NextLink href={menuItem.route} passHref legacyBehavior>
										<Link
											sx={{
												color: menuItem.route === pathname ? "var(--primary)" : "currentColor",
												fontWeight: menuItem.route === pathname ? "500" : "400",
											}}
											underline="none"
										>
											{menuItem.title}
										</Link>
									</NextLink>
								</ListItem>
							);
						})}
					</List>
					<Divider sx={{ my: "2rem" }} />
					<Button variant="text" fullWidth sx={{ borderRadius: "1rem", color: "grey" }} onClick={handleLogout}>
						Log Out
					</Button>
				</Wrapper>
			</Wrapper>
		</Box>
	);
}
