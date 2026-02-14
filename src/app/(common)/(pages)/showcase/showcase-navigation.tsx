"use client";

import { TreeElement } from "@/lib/showcase/tree";
import { ExpandLess, ExpandMore, Menu, MusicNote } from "@mui/icons-material";
import {
	Box,
	CircularProgress,
	Collapse,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	Typography,
	useScrollTrigger
} from "@mui/material";
import { Fragment, useRef, useState } from "react";

export default function ShowcaseNavigation({ tree }: { tree: TreeElement[] }) {
	const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
	const [selectedFolder, setSelectedFolder] = useState<TreeElement | null>(tree[0]);
	const [open, setOpen] = useState(false);
	const trigger = useScrollTrigger({ threshold: 300 });

	const toggleFolder = (path: string, node: TreeElement) => {
		setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
		setSelectedFolder(node);
	};

	const renderList = (nodes: TreeElement[], level = 0) => (
		<List component='div' disablePadding sx={{ width: "100%" }}>
			{nodes.map((node) =>
				node.type === "folder" ? (
					<Fragment key={node.path}>
						<ListItem disableGutters sx={{ pl: level * 2 }}>
							<ListItemButton
								onClick={() => {
									if (node.type === "folder") toggleFolder(node.path, node);
								}}
								sx={{ borderRadius: "0.5rem" }}
							>
								<ListItemText primary={node.name} />

								<ListItemIcon sx={{ minWidth: 0 }}>
									{node.counter ? (
										<Typography
											sx={{
												background: "var(--primary)",
												p: "0.25rem 0.5rem",
												borderRadius: "100px",
												color: "var(--background)",
												fontWeight: 400
											}}
										>
											{node.counter}
										</Typography>
									) : null}
								</ListItemIcon>
								<ListItemIcon sx={{ minWidth: 0 }}>
									{node.type === "folder" && node.children.filter((child) => child.type === "folder").length > 0 ? (
										openFolders[node.path] ? (
											<ExpandLess />
										) : (
											<ExpandMore />
										)
									) : (
										<ExpandLess sx={{ transform: "rotate(90deg)" }} />
									)}
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						{node.children && (
							<Collapse in={openFolders[node.path]} timeout='auto' unmountOnExit>
								{renderList(node.children, level + 1)}
							</Collapse>
						)}
					</Fragment>
				) : null
			)}
		</List>
	);

	const renderPreviews = () => {
		if (!selectedFolder) return null;

		const previewItems = (function findFiles(node: TreeElement): TreeElement[] {
			const files = node.children.filter((child) => child.type === "video" || child.type === "audio");
			const subFiles = node.children.filter((child) => child.type === "folder").flatMap((folder) => findFiles(folder));
			return [...files, ...subFiles];
		})(selectedFolder);

		return (
			<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
				<Typography variant='h6'>{selectedFolder.name}</Typography>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { md: "repeat(auto-fill, minmax(200px, 1fr))", sm: "1fr 1fr", xs: "1fr" },
						gap: "1rem",
						overflowY: "auto"
					}}
				>
					{previewItems.map((item) => (
						<Box
							key={item.path}
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: "0.5rem",
								py: "1rem",
								borderRadius: "0.5rem",
								backgroundColor: "var(--background-gradient)"
							}}
						>
							{item.type === "video" && item.media && (
								<video
									src={item.media}
									autoPlay
									muted
									loop
									style={{
										width: "100%",
										height: "auto",
										aspectRatio: "16/9",
										objectFit: "cover",
										borderRadius: "0.25rem"
									}}
								/>
							)}
							{item.type === "audio" && item.media && <AudioItem item={item} />}
							{item.description && (
								<Typography variant='body2' sx={{ color: "text.secondary", textWrap: "balance" }}>
									{item.description}
								</Typography>
							)}
						</Box>
					))}
				</Box>
			</Box>
		);
	};

	return (
		<Box sx={{ display: "grid", gridTemplateColumns: { md: "400px 1fr", xs: "1fr" }, gap: "1rem", width: "100%" }}>
			<Box
				sx={{
					display: { xs: "flex", md: "none" },
					alignItems: "center",
					justifyContent: "space-between",
					p: "1rem",
					position: trigger ? "fixed" : "relative",
					top: 0,
					left: 0,
					right: 0,
					zIndex: 1,
					background: "var(--background)"
				}}
			>
				<Typography fontWeight={400} fontSize={"1.25rem"}>
					Select Category
				</Typography>
				<IconButton onClick={() => setOpen(true)}>
					<Menu />
				</IconButton>
			</Box>
			<Drawer
				anchor='right'
				open={open}
				onClose={() => setOpen(false)}
				slotProps={{ paper: { elevation: 0, sx: { width: "70vw" } } }}
			>
				<Box sx={{ overflowY: "auto", "&::-webkit-scrollbar": { display: "none" } }}>{renderList(tree)}</Box>
			</Drawer>
			<Box sx={{ overflowY: "auto", display: { xs: "none", md: "block" } }}>{renderList(tree)}</Box>
			<Box sx={{ overflowY: "auto" }}>{renderPreviews()}</Box>
		</Box>
	);
}

const AudioItem = ({ item }: { item: TreeElement }) => {
	const [hover, setHover] = useState(false);
	const [value, setValue] = useState(0);
	const audioRef = useRef<HTMLAudioElement>(null);

	const mouseEnter = () => {
		setHover(true);
		if (!audioRef.current) return;
		audioRef.current.currentTime = 0;
		audioRef.current.play();
	};

	const mouseLeave = () => {
		setHover(false);
		if (!audioRef.current) return;
		audioRef.current.currentTime = 0;
		audioRef.current.pause();
	};

	const handleTimeUpdate = () => {
		if (!audioRef.current) return;
		const currentTime = audioRef.current.currentTime;
		const duration = audioRef.current.duration || 1;
		const progress = Math.min((currentTime / Math.floor(duration)) * 100, 100);
		setValue(progress);
	};

	return (
		<>
			<Paper
				variant='outlined'
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "auto",
					aspectRatio: "16/9",
					background: "var(--background-gradient)",
					position: "relative",
					"& .MuiCircularProgress-root": {
						position: "absolute",
						left: "50%",
						top: "50%",
						transform: "translate(-50%, -50%) rotate(-90deg)!important",
						zIndex: 1
					}
				}}
				onMouseEnter={mouseEnter}
				onMouseLeave={mouseLeave}
			>
				<MusicNote
					sx={{
						position: "absolute",
						left: "50%",
						top: "50%",
						transform: "translate(-50%, -50%)",
						zIndex: 1,
						fontSize: "4rem"
					}}
				/>
				<CircularProgress value={value} variant='determinate' size={100} thickness={2} />
				<audio ref={audioRef} src={item.media} muted={!hover} loop onTimeUpdate={handleTimeUpdate} />
			</Paper>
		</>
	);
};
