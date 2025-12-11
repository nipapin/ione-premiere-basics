"use client";

import { TreeElement } from "@/lib/utils";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Box, Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import { useTree } from "@/contexts/TreeWrapper";

export default function HelpMenu() {
	const tree = useTree();
	const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
	const pathname = usePathname();

	const toggleFolder = (path: string) => {
		setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
	};

	const renderList = (nodes: TreeElement[], level = 0) => (
		<List component="div" disablePadding sx={{ width: "100%" }}>
			{nodes.map((node) =>
				node.type === "folder" ? (
					<Fragment key={node.path}>
						<ListItem disableGutters>
							<ListItemButton
								onClick={() => node.type === "folder" && toggleFolder(node.path)}
								sx={{ borderRadius: "0.5rem" }}
							>
								<ListItemText primary={node.name} />
								<ListItemIcon sx={{ minWidth: 0 }}>
									{node.type === "folder" && (openFolders[node.path] ? <ExpandLess /> : <ExpandMore />)}
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						{node.children && (
							<Collapse in={!openFolders[node.path]} timeout="auto" unmountOnExit>
								{renderList(node.children, level + 1)}
							</Collapse>
						)}
					</Fragment>
				) : (
					<ListItem sx={{ pl: level * 2 }} key={node.path}>
						<Link href={node.href} passHref style={{ width: "100%", textDecoration: "none" }}>
							<ListItemButton
								sx={{
									borderRadius: "0.5rem",
									color: pathname === node.href ? "var(--primary)" : "white",
								}}
							>
								<ListItemText primary={node.name} />
							</ListItemButton>
						</Link>
					</ListItem>
				)
			)}
		</List>
	);

	return (
		<Wrapper
			variant="animated"
			fullWidth
			sx={{ maxHeight: "fit-content", height: "fit-content", position: "sticky", top: 0, left: 0 }}
		>
			<Box sx={{ p: "1rem", background: "var(--background-gradient)", width: "100%" }}>{renderList(tree)}</Box>
		</Wrapper>
	);
}
