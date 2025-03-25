"use client";

import { Clear, Menu } from "@mui/icons-material";
import { Box, List, ListItem } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import LogoLink from "./LogoLink";
import { navItems } from "./NavBarLinks";
import StyledLink from "./StyledLink";
import { usePathname } from "next/navigation";

export default function MediumMenu() {
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
			<IconButton
				sx={{ display: { xs: "none", md: "block", xl: "none" } }}
				onClick={toggle(true)}
			>
				<Menu />
			</IconButton>
			<Drawer open={open} onClose={toggle(false)} dir='left' elevation={0}>
				<Box
					sx={{
						width: "300px",
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
