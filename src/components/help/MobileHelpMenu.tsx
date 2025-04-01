import { useTree } from "@/contexts/TreeWrapper";
import { TreeElement } from "@/lib/utils";
import { ExpandLess, ExpandMore, Menu } from "@mui/icons-material";
import { Box, Collapse, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

export default function MobileHelpMenu() {
	const tree = useTree();
	const [open, setOpen] = useState(false);
	const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
	const pathname = usePathname();

	const toggleFolder = (path: string) => {
		setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
	};

	const renderList = (nodes: TreeElement[], level = 0) => (
		<List component='div' disablePadding sx={{ width: "100%" }}>
			{nodes.map((node) =>
				node.type === "folder" ? (
					<Fragment key={node.path}>
						<ListItem disableGutters>
							<ListItemButton onClick={() => node.type === "folder" && toggleFolder(node.path)} sx={{ borderRadius: "0.5rem" }}>
								<ListItemText primary={node.name} sx={{ textWrap: "nowrap", "& span": { fontWeight: 400 } }} />
								<ListItemIcon sx={{ minWidth: 0 }}>
									{node.type === "folder" && (openFolders[node.path] ? <ExpandLess /> : <ExpandMore />)}
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						{node.children && (
							<Collapse in={!openFolders[node.path]} timeout='auto' unmountOnExit>
								{renderList(node.children, level + 1)}
							</Collapse>
						)}
					</Fragment>
				) : (
					<ListItem sx={{ pl: level * 2 }} key={node.path}>
						<Link href={node.href} passHref legacyBehavior>
							<ListItemButton sx={{ borderRadius: "0.5rem", color: pathname === node.href ? "var(--primary)" : "inherit" }}>
								<ListItemText primary={node.name} sx={{ textWrap: "nowrap" }} />
							</ListItemButton>
						</Link>
					</ListItem>
				)
			)}
		</List>
	);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		<Box sx={{ display: { md: "none", sm: "block" } }}>
			<IconButton onClick={() => setOpen(true)}>
				<Menu />
			</IconButton>
			<Drawer open={open} onClose={() => setOpen(false)} anchor='left' slotProps={{ paper: { elevation: 0 } }}>
				<Box sx={{ p: "1rem" }}>{renderList(tree)}</Box>
			</Drawer>
		</Box>
	);
}
