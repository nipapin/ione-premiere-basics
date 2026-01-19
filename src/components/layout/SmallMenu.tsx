"use client";

import { AccountCircle, Clear, Menu } from "@mui/icons-material";
import { Box, List, ListItem, Stack, useMediaQuery, useTheme } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoLink from "../ui/LogoLink";
import StyledLink from "../ui/StyledLink";
import { navItems } from "./NavBarLinks";

export default function SmallMenu() {
	const pathname = usePathname();
	const [open, setOpen] = useState<boolean>(false);

	const theme = useTheme();
	const isTabled = useMediaQuery(theme.breakpoints.down("md"));

	const toggle = (state: boolean) => () => {
		setOpen(state);
	};

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		isTabled && (
			<>
				<Stack direction={"row"} sx={{ display: { md: "none", xs: "inline-flex" }, ml: "auto" }}>
					<Link href={"/login"} passHref>
						<IconButton >
							<AccountCircle />
						</IconButton>
					</Link>
					<IconButton sx={{ display: { xs: "block", md: "none" } }} onClick={toggle(true)}>
						<Menu />
					</IconButton>
				</Stack>
				<Drawer open={open} onClose={toggle(false)} anchor="right" elevation={0}>
					<Box
						sx={{
							width: "100vw",
							height: "100%",
							background: "var(--background-gradient)",
						}}
					>
						<List disablePadding>
							<ListItem
								sx={{
									background: "var(--background)",
									py: "1rem",
									height: "78px",
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
		)
	);
}
