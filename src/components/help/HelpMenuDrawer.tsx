"use client";

import { Menu } from "@mui/icons-material";
import {
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemButton
} from "@mui/material";
import { useState } from "react";

export default function HelpMenuDrawer() {
	const [open, setOpen] = useState<boolean>(false);
	return (
		<>
			<IconButton onClick={() => setOpen(true)}>
				<Menu />
			</IconButton>
			<Drawer
				open={open}
				onClose={() => setOpen(false)}
				variant='temporary'
				slotProps={{ paper: { elevation: 0 } }}
			>
				<List sx={{ minWidth: "50vw" }}>
					{[1, 2, 3].map((element) => {
						return (
							<ListItem key={element} disablePadding>
								<ListItemButton>Item {element}</ListItemButton>
							</ListItem>
						);
					})}
				</List>
			</Drawer>
		</>
	);
}
