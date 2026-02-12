"use client";

import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function HeroVideo({ controls }: { controls?: boolean }) {
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [videoSrc, setVideoSrc] = useState<string>();

	useEffect(() => {
		const timeout = setTimeout(() => {
			setVideoSrc("https://cdn.odin-pro.com/cover.mp4");
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
				overflow: "hidden",
			}}
		>
			<video
				// ref={videoRef}
				loop
				muted={!controls}
				controls={controls}
				disablePictureInPicture
				controlsList="nodownload"
				playsInline={isVideoPlaying}
				autoPlay={isVideoPlaying}
				width={1280}
				height={720}
				poster="/images/cover-poster.jpg"
				src={videoSrc}
				preload="metadata"
				style={{
					width: "100%",
					height: "auto",
					aspectRatio: "16/9",
					objectFit: "cover",
				}}
			/>
		</Box>
	);
}
