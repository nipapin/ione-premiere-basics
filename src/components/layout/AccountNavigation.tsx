"use client";

import {
	Box,
	Button,
	Divider,
	Link,
	List,
	ListItem,
	Typography
} from "@mui/material";
import { usePathname } from "next/navigation";
import { Wrapper } from "./Wrapper";
import NextLink from "next/link";

type MenuItem = {
	id: number;
	title: string;
	route: string;
};

const menuItems: MenuItem[] = [
	{
		id: 1,
		title: "Account Details",
		route: "/account"
	},
	{
		id: 2,
		title: "Subscription",
		route: "/account/subscription"
	},
	{
		id: 3,
		title: "My Devices",
		route: "/account/devices"
	},
	{
		id: 4,
		title: "Extension",
		route: "/account/extension"
	}
];

export default function AccountNavigation() {
	const pathname = usePathname();
	return (
		<Box>
			<Wrapper variant='animated'>
				<Wrapper
					sx={{ background: "var(--background-gradient)" }}
					fullWidth
					padding={"2rem"}
				>
					<Typography sx={{ fontWeight: "400" }}>My Account</Typography>
					<Typography sx={{ fontWeight: "400" }}>
						username@website.com
					</Typography>
					<Divider sx={{ my: "2rem" }} />
					<List disablePadding>
						{menuItems.map((menuItem) => {
							return (
								<ListItem
									disableGutters
									disablePadding
									key={menuItem.id}
									sx={{ my: "1rem" }}
								>
									<NextLink href={menuItem.route} passHref legacyBehavior>
										<Link
											sx={{
												color:
													menuItem.route === pathname
														? "var(--primary)"
														: "currentColor",
												fontWeight: menuItem.route === pathname ? "500" : "400"
											}}
											underline='none'
										>
											{menuItem.title}
										</Link>
									</NextLink>
								</ListItem>
							);
						})}
					</List>
					<Divider sx={{ my: "2rem" }} />
					<Button
						variant='text'
						fullWidth
						sx={{ borderRadius: "1rem", color: "grey" }}
					>
						Log Out
					</Button>
					{/* <LogoutButton /> */}
				</Wrapper>
			</Wrapper>
		</Box>
	);
}
