"use client";

import {
	Box,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
	useMediaQuery,
	useTheme,
	Avatar,
	IconButton,
	Divider,
	Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const DRAWER_WIDTH = 240;

const menuItems = [
	{ id: "overview", label: "Overview", icon: <DashboardIcon />, href: "/panel/dashboard" },
	{ id: "users", label: "Users", icon: <PeopleIcon />, href: "/panel/dashboard/users" },
	{
		id: "subscriptions",
		label: "Subscriptions",
		icon: <SubscriptionsIcon />,
		href: "/panel/dashboard/subscriptions",
	},
	{ id: "settings", label: "Settings", icon: <SettingsIcon />, href: "/panel/dashboard/settings" },
];

interface SidebarProps {
	children: React.ReactNode;
	adminName?: string;
}

export default function Sidebar({ children, adminName }: SidebarProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const drawerContent = (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
			{/* Logo */}
			<Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
				<Box
					sx={{
						width: 36,
						height: 36,
						borderRadius: "8px",
						bgcolor: "primary.main",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "background.default",
						fontWeight: 700,
						fontSize: 18,
					}}
				>
					A
				</Box>
				<Typography variant="h6" fontWeight={700}>
					Admin Panel
				</Typography>
			</Box>

			<Divider sx={{ mx: 2 }} />

			{/* Navigation */}
			<List sx={{ px: 2, pt: 2, flex: 1 }}>
				{menuItems.map((item) => {
					const isActive = pathname === item.href;

					return (
						<ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
							<ListItemButton
								component={Link}
								href={item.href}
								onClick={() => isMobile && setMobileOpen(false)}
								sx={{
									borderRadius: "8px",
									py: 1.25,
									bgcolor: isActive ? "primary.main" : "transparent",
									color: isActive ? "background.default" : "text.secondary",
									"&:hover": {
										bgcolor: isActive ? "primary.dark" : "action.hover",
									},
									transition: "all 0.2s",
								}}
							>
								<ListItemIcon
									sx={{
										minWidth: 40,
										color: isActive ? "background.default" : "text.secondary",
									}}
								>
									{item.icon}
								</ListItemIcon>
								<ListItemText
									primary={item.label}
									primaryTypographyProps={{
										fontWeight: isActive ? 600 : 500,
										fontSize: "0.9rem",
									}}
								/>
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>

			{/* Admin Profile */}
			<Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						p: 1.5,
						borderRadius: "8px",
						bgcolor: "action.hover",
						mb: 1.5,
					}}
				>
					<Avatar
						sx={{
							width: 36,
							height: 36,
							bgcolor: "primary.main",
							color: "background.default",
							fontSize: "0.9rem",
							fontWeight: 600,
						}}
					>
						{adminName?.[0]?.toUpperCase() || "A"}
					</Avatar>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography variant="body2" fontWeight={600} noWrap>
							{adminName || "Admin"}
						</Typography>
						<Typography variant="caption" color="text.secondary" noWrap>
							Administrator
						</Typography>
					</Box>
				</Box>
				<Button
					component={Link}
					href="/"
					fullWidth
					variant="outlined"
					startIcon={<HomeIcon />}
					sx={{
						borderRadius: "8px",
						textTransform: "none",
						borderColor: "divider",
						color: "text.secondary",
						py: 1,
						"&:hover": {
							borderColor: "primary.main",
							bgcolor: "action.hover",
						},
					}}
				>
					Back to Website
				</Button>
			</Box>
		</Box>
	);

	return (
		<Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
			{/* Mobile Menu Button */}
			{isMobile && (
				<IconButton
					onClick={handleDrawerToggle}
					sx={{
						position: "fixed",
						top: 16,
						left: 16,
						zIndex: theme.zIndex.drawer + 2,
						bgcolor: "background.paper",
						boxShadow: 2,
						"&:hover": { bgcolor: "action.hover" },
					}}
				>
					<MenuIcon />
				</IconButton>
			)}

			{/* Sidebar Drawer */}
			<Drawer
				variant={isMobile ? "temporary" : "permanent"}
				open={isMobile ? mobileOpen : true}
				onClose={handleDrawerToggle}
				ModalProps={{ keepMounted: true }}
				sx={{
					width: DRAWER_WIDTH,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: DRAWER_WIDTH,
						boxSizing: "border-box",
						border: "none",
						boxShadow: isMobile ? 3 : "2px 0 8px rgba(0,0,0,0.04)",
					},
				}}
			>
				{drawerContent}
			</Drawer>

			{/* Main Content */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
					minHeight: "100vh",
				}}
			>
				{children}
			</Box>
		</Box>
	);
}
