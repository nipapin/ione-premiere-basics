"use client";

import { AccountCircle, Clear, Menu } from "@mui/icons-material";
import { Box, List, ListItem, Stack } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoLink from "./LogoLink";
import { navItems } from "./NavBarLinks";
import StyledLink from "./StyledLink";
import Link from "next/link";

export default function SmallMenu() {
	const pathname = usePathname();
	const [open, setOpen] = useState<boolean>(false);

	const toggle = (state: boolean) => () => {
		setOpen(state);
	};

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		<>
			<Stack direction={"row"}>
				<Link href={"/login"} passHref legacyBehavior>
					<IconButton
						sx={{ display: { md: "none", xs: "inline-flex" } }}
						href='/login'
					>
						<AccountCircle />
					</IconButton>
				</Link>
				<IconButton
					sx={{ display: { xs: "block", md: "none" } }}
					onClick={toggle(true)}
				>
					<Menu />
				</IconButton>
			</Stack>
			<Drawer open={open} onClose={toggle(false)} anchor='right' elevation={0}>
				<Box
					sx={{
						width: "100vw",
						height: "100%",
						background: "var(--background-gradient)"
					}}
				>
					<List disablePadding>
						<ListItem
							sx={{
								background: "var(--background)",
								py: "1rem",
								height: "78px"
							}}
							secondaryAction={
								<IconButton onClick={toggle(false)}>
									<Clear />
								</IconButton>
							}
						>
							<LogoLink />
						</ListItem>
						{navItems.map((item) => {
							return (
								<ListItem key={item.id} sx={{ mb: "1rem" }}>
									<StyledLink href={item.href} active={pathname === item.href}>
										{item.label}
									</StyledLink>
								</ListItem>
							);
						})}
					</List>
				</Box>
			</Drawer>
		</>
	);
}
