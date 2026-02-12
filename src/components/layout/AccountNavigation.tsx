"use client";

import { logout } from "@/actions/user";
import { useUser } from "@/contexts/UserWrapper";
import { MoreVert } from "@mui/icons-material";
import { Box, Button, Divider, Drawer, IconButton, Link, List, ListItem, Skeleton, Typography } from "@mui/material";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Wrapper } from "./Wrapper";

type MenuItem = {
	id: number;
	title: string;
	route: string;
	adminOnly: boolean
};

const menuItems: MenuItem[] = [
	{
		id: 1,
		title: "Account Details",
		route: "/account",
		adminOnly: false
	},
	{
		id: 2,
		title: "Orders",
		route: "/account/subscription",
		adminOnly: false
	},
	{
		id: 3,
		title: "Affilates",
		route: "/account/affilates",
		adminOnly: true
	}
];

export default function AccountNavigation({ isAdmin }: { isAdmin?: boolean }) {
	const [open, setOpen] = useState<boolean>(false);
	const pathname = usePathname();
	const router = useRouter();
	const { user } = useUser();

	const userItems = menuItems.filter((item) => !item.adminOnly);
	const adminItems = menuItems.filter((item) => item.adminOnly);

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		<Box>
			<Wrapper variant="animated" sx={{ "--border-radius": "1rem" }}>
				<Box
					sx={{
						p: "2rem",
						display: { lg: "flex", xs: "none" },
						flexDirection: "column",
						gap: "1rem",
						background: "var(--background-gradient)",
						width: "100%",
					}}
				>
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
						{userItems.map((menuItem) => {
							return (
								<ListItem disableGutters disablePadding key={menuItem.id} sx={{ my: "1rem" }}>
									<NextLink href={menuItem.route} passHref>
										<Link
											component={'span'}
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
						{isAdmin ? adminItems.map((menuItem) => {
							return (
								<ListItem disableGutters disablePadding key={menuItem.id} sx={{ my: "1rem" }}>
									<NextLink href={menuItem.route} passHref>
										<Link
											component={'span'}
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
						}) : null}
					</List>
					<Divider sx={{ my: "2rem" }} />
					<Button
						variant="text"
						fullWidth
						sx={{ borderRadius: "1rem", color: "grey", display: { md: "block", sm: "none" } }}
						onClick={handleLogout}
					>
						Log Out
					</Button>
				</Box>
				<Box
					sx={{
						width: "100%",
						display: { lg: "none", xs: "flex" },
						justifyContent: "space-between",
						alignItems: "center",
						p: "1rem",
						background: "var(--background-gradient)",
					}}
				>
					<Box>
						<Typography fontWeight={400} fontSize={"1.5rem"}>
							My Account
						</Typography>
						<Typography fontWeight={200} fontSize={"1rem"} color="primary">
							{user?.email}
						</Typography>
					</Box>
					<IconButton onClick={() => setOpen(true)}>
						<MoreVert />
					</IconButton>
					<Drawer
						anchor="right"
						open={open}
						onClose={() => setOpen(false)}
						slotProps={{ paper: { elevation: 0, sx: { width: "50%", overflow: "hidden" } } }}
					>
						<List sx={{ width: "100%" }}>
							{userItems.map((menuItem) => {
								return (
									<ListItem key={menuItem.id} sx={{ my: "1rem" }}>
										<NextLink href={menuItem.route} passHref>
											<Link
												component={'span'}
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
							{isAdmin ? adminItems.map((menuItem) => {
								return (
									<ListItem key={menuItem.id} sx={{ my: "1rem" }}>
										<NextLink href={menuItem.route} passHref>
											<Link
												component={'span'}
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
							}) : null}
						</List>
					</Drawer>
				</Box>
			</Wrapper>
		</Box>
	);
}
