"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import { useEffect, useRef } from "react";

const logos: string[] = [
	"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/logo-clouds/rbs-white.png",
	"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/logo-clouds/nine-white.png",
	"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/logo-clouds/drift-white.png",
	"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/logo-clouds/seek-white.png",
	"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/logo-clouds/deloitte-white.png",
	"https://static.shuffle.dev/components/preview/697340ff-5445-426e-84bf-57e856b9afbf/assets/public/nightsable-assets/images/logo-clouds/wise-white.png"
];

export default function LogoCarousel() {
	const trackRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		const item = track.children[logos.length] as HTMLElement;

		track.style.setProperty("--scroll-to", `${-item.offsetLeft}px`);
	}, []);

	return (
		<Box
			sx={{
				overflow: "hidden",
				whiteSpace: "nowrap",
				position: "relative",
				width: { xl: "60%", md: "80%", xs: "100%" },
				py: { xl: "2rem", xs: "1rem" },
				m: "0 auto",
				"&::before": {
					content: `""`,
					display: "block",
					width: "100%",
					height: "100%",
					position: "absolute",
					left: 0,
					top: 0,
					background:
						"linear-gradient(90deg, var(--background) 0%, transparent 25%, transparent 75%, var(--background) 100%)",
					zIndex: 1
				}
			}}
		>
			<Box
				ref={trackRef}
				sx={{
					display: "flex",
					gap: "2rem",
					animation: "scroll-logo 20s linear infinite;",
					"& .logo": { flexShrink: 0, width: "auto", height: "50px" }
				}}
			>
				{[...logos, ...logos, ...logos].map((logo, index) => {
					return (
						<Image
							key={index}
							src={logo}
							alt='scrolling logo'
							className='logo'
							width={121}
							height={55}
						/>
					);
				})}
			</Box>
		</Box>
	);
}
