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
						onClick={() => setActive(index)}
					>
						<Typography sx={{ textWrap: "nowrap", fontSize: { xs: "0.875rem", sm: "1rem" } }}>{tool.label}</Typography>
					</Button>
				))}
			</Box>
			<Box sx={styles.imageContainer}>
				<Wrapper variant='animated' fullWidth>
					{powerfulTools[active].audio && (
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
					{powerfulTools[active].media.endsWith(".mp4") ? (
						<video
							src={powerfulTools[active].media}
							poster={powerfulTools[active].poster}
							autoPlay
							muted={!audio}
							loop
							style={{ width: "100%", height: "100%" }}
							width={1280}
							height={720}
							ref={videoRef}
						/>
					) : (
						<Image
							src={powerfulTools[active].media}
							alt={powerfulTools[active].label}
							width={1280}
							height={720}
							priority
						/>
					)}
				</Wrapper>
			</Box>
		</Box>
	);
}
