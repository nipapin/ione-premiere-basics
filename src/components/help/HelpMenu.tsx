"use client";

import { TreeElement } from "@/lib/utils";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, List, ListItemButton, ListItemText } from "@mui/material";
import Link from "next/link";
import { Fragment, useState } from "react";

interface HelpMenuProps {
	tree: TreeElement[];
}

export default function HelpMenu({ tree }: HelpMenuProps) {
	const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

	const toggleFolder = (path: string) => {
		setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
	};

	const renderList = (nodes: TreeElement[], level = 0) => (
		<List component='div' disablePadding>
			{nodes.map((node) =>
				node.type === "folder" ? (
					<Fragment key={node.path}>
						<ListItemButton
							onClick={() => node.type === "folder" && toggleFolder(node.path)}
							sx={{ pl: level * 2 }}
						>
							<ListItemText primary={node.name} />
							{node.type === "folder" &&
								(openFolders[node.path] ? <ExpandLess /> : <ExpandMore />)}
						</ListItemButton>
						{node.children && (
							<Collapse
								in={openFolders[node.path]}
								timeout='auto'
								unmountOnExit
							>
								{renderList(node.children, level + 1)}
							</Collapse>
						)}
					</Fragment>
				) : (
					<Link key={node.path} href={node.href} passHref legacyBehavior>
						<ListItemButton href='' sx={{ pl: level * 2 }}>
							<ListItemText primary={node.name} />
						</ListItemButton>
					</Link>
				)
			)}
		</List>
	);

	return <>{renderList(tree)}</>;
}
