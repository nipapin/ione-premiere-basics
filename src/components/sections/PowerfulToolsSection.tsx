"use client";

import { powerfulTools, styles } from "@/entities/tools";
import { Box, Button, IconButton, Typography } from "@mui/material";
import Image from "next/image";
import { useRef, useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import Title from "../ui/Title";
import { VolumeOff, VolumeUp } from "@mui/icons-material";

export default function PowerfulTools() {
	const [active, setActive] = useState<number>(0);
	const [audio, setAudio] = useState<boolean>(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	return (
		<Box component='section' sx={styles.section}>
			<Title>{`What's inside?`}</Title>
			<Box sx={styles.toolsGrid}>
				{powerfulTools.map((tool, index) => (
					<Button
						key={tool.id}
						sx={styles.toolButton(index === active, index)}
						variant='outlined'
						onClick={() => {
							setActive(index);
							setAudio(false);
						}}
					>
						<Typography sx={{ textWrap: "nowrap", fontSize: { xs: "0.875rem", sm: "1rem" } }}>{tool.label}</Typography>
					</Button>
				))}
			</Box>
			<Box sx={styles.imageContainer}>
				{powerfulTools.map((tool, index) => {
					return (
						<Wrapper variant='animated' fullWidth key={tool.id} sx={{ display: index === active ? "block" : "none" }}>
							{tool.audio && (
								<IconButton
									sx={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 1000 }}
									onClick={() => {
										setAudio(!audio);
										if (videoRef.current) {
											videoRef.current.volume = 0.7;
										}
									}}
								>
									{audio ? <VolumeUp /> : <VolumeOff />}
								</IconButton>
							)}
							<Box sx={{ "& video": { width: "100%", height: "auto", aspectRatio: "16/9" } }}>
								<video
									src={tool.media}
									poster={tool.poster}
									autoPlay
									muted={tool.audio ? !audio : true}
									loop
									playsInline
									width={1280}
									height={720}
								/>
							</Box>
						</Wrapper>
					);
				})}
			</Box>
		</Box>
	);
}
