"use client";

import { Box } from "@mui/material";
import { useEffect, useState } from "react";

export default function HeroVideo() {
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [videoSrc, setVideoSrc] = useState<string>();
	useEffect(() => {
		const timeout = setTimeout(() => {
			setVideoSrc("https://lzsyykhroxoqmjgoxhrs.supabase.co/storage/v1/object/public/odin-pro-media//cover.mp4");
			setIsVideoPlaying(true);
		}, 1000);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<Box
			sx={{
				position: "relative",
				width: "100%",
				height: "auto",
				aspectRatio: "16/9",
				maxWidth: "1280px",
				maxHeight: "720px",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				overflow: "hidden"
			}}
		>
			<video
				loop
				muted
				playsInline={isVideoPlaying}
				autoPlay={isVideoPlaying}
				width={1280}
				height={720}
				poster='https://lzsyykhroxoqmjgoxhrs.supabase.co/storage/v1/object/public/odin-pro-media//cover-poster.webp'
				src={videoSrc}
				preload='metadata'
				style={{
					width: "100%",
					height: "auto",
					aspectRatio: "16/9",
					objectFit: "cover"
				}}
			/>
		</Box>
	);
}
