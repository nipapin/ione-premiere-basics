"use client";

import { useState } from "react";
import { AppBar, Toolbar, IconButton, Typography, Box, Drawer, List, ListItem, ListItemText, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

const navItems = ["Главная", "О нас", "Контакты"];

export default function ResponsiveNav() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	return (
		<>
			<AppBar position='static'>
				<Toolbar>
					{isMobile && (
						<IconButton edge='start' color='inherit' aria-label='menu' onClick={handleDrawerToggle}>
							<MenuIcon />
						</IconButton>
					)}
					<Typography variant='h6' sx={{ flexGrow: 1 }}>
						Мой сайт
					</Typography>
					{!isMobile && (
						<Box sx={{ display: "flex" }}>
							{navItems.map((item) => (
								<Typography key={item} sx={{ ml: 2, cursor: "pointer" }}>
									{item}
								</Typography>
							))}
						</Box>
					)}
				</Toolbar>
			</AppBar>

			{/* Боковое меню для мобильных */}
			<Drawer anchor='left' open={mobileOpen} onClose={handleDrawerToggle}>
				<List>
					{navItems.map((item) => (
						<ListItem key={item} onClick={handleDrawerToggle}>
							<ListItemText primary={item} />
						</ListItem>
					))}
				</List>
			</Drawer>
		</>
	);
}
