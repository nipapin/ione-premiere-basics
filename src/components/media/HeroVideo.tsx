"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import { DetailedHTMLProps, VideoHTMLAttributes, useEffect, useState } from "react";

export default function HeroVideo(props: DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>) {
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsVideoPlaying(true);
		}, 1000);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<Box sx={{ position: "relative", width: "100%", height: "100%", maxWidth: "1280px", maxHeight: "720px" }}>
			{isVideoPlaying && (
				<video
					loop
					muted
					playsInline
					autoPlay={true}
					width={1280}
					height={720}
					poster='https://lzsyykhroxoqmjgoxhrs.supabase.co/storage/v1/object/public/odin-pro-media//cover-poster.webp'
					src='https://lzsyykhroxoqmjgoxhrs.supabase.co/storage/v1/object/public/odin-pro-media//cover.mp4'
					preload='none'
					{...props}
					style={{
						width: "100%",
						height: "100%"
					}}
				/>
			)}
			<Image
				src='https://lzsyykhroxoqmjgoxhrs.supabase.co/storage/v1/object/public/odin-pro-media//cover-poster.webp'
				alt='Video poster'
				style={{ width: "100%", height: "auto", display: isVideoPlaying ? "none" : "block" }}
				width={1280}
				height={720}
			/>
		</Box>
	);
}
