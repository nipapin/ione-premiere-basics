"use client";

import { rows, styles } from "@/entities/showcases";
import { Box, Button, Stack, Typography, useScrollTrigger } from "@mui/material";
import Link from "next/link";
import { memo, useEffect, useMemo, useRef } from "react";
import { Wrapper } from "../layout/Wrapper";

const getAnimation = (index: number) =>
	index === 1 ? "scroll-logo 120s linear infinite reverse" : "scroll-logo 120s linear infinite";

// Оптимизация кеширования видео
const videoCache = new Map<string, { video: HTMLVideoElement; lastUsed: number }>();
const CACHE_LIMIT = 20; // Максимальное количество видео в кеше
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 минут в миллисекундах

function getVideoClone(name: string): HTMLVideoElement {
	const now = Date.now();

	// Очистка устаревших видео
	if (videoCache.size >= CACHE_LIMIT) {
		for (const [key, value] of videoCache.entries()) {
			if (now - value.lastUsed > CACHE_EXPIRY) {
				videoCache.delete(key);
			}
		}
	}

	if (!videoCache.has(name)) {
		const video = document.createElement("video");
		video.src = `https://lzsyykhroxoqmjgoxhrs.supabase.co/storage/v1/object/public/odin-pro-media/graphics/${name}.webm`;
		video.poster = `https://lzsyykhroxoqmjgoxhrs.supabase.co/storage/v1/object/public/odin-pro-media/graphics/${name}.webp`;
		video.muted = true;
		video.loop = true;
		video.preload = "metadata";
		video.width = 256;
		video.height = 144;
		videoCache.set(name, { video, lastUsed: now });
	} else {
		videoCache.get(name)!.lastUsed = now;
	}

	return videoCache.get(name)!.video.cloneNode(true) as HTMLVideoElement;
}

const ElementCard = memo(({ name }: { name: string }) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	const togglePlay = useMemo(() => {
		return (state: boolean) => () => {
			if (!videoRef.current) return;
			if (state) {
				videoRef.current.currentTime = 0;
				videoRef.current.play();
			} else {
				videoRef.current.currentTime = videoRef.current.duration;
				videoRef.current.pause();
			}
		};
	}, []);

	useEffect(() => {
		const currentVideo = videoRef.current;
		if (currentVideo) {
			const video = getVideoClone(name);
			currentVideo.src = video.src;
			currentVideo.poster = video.poster;
			currentVideo.muted = true;
			currentVideo.loop = true;
			currentVideo.preload = "metadata";
		}

		return () => {
			if (currentVideo) {
				currentVideo.muted = true;
				currentVideo.pause();
				currentVideo.src = "";
				currentVideo.poster = "";
			}
		};
	}, [name]);

	return (
		<video
			ref={videoRef}
			onMouseEnter={togglePlay(true)}
			onMouseLeave={togglePlay(false)}
			style={{
				width: "256px",
				height: "144px",
				objectFit: "cover",
				backgroundColor: "var(--background-gradient)"
			}}
			muted
			loop
			preload='metadata'
			width={256}
			height={144}
		/>
	);
});

ElementCard.displayName = "ElementCard";

export default function Showcase() {
	const trigger = useScrollTrigger({ threshold: 1000, disableHysteresis: true });
	const firstRowRef = useRef<HTMLDivElement | null>(null);
	const secondRowRef = useRef<HTMLDivElement | null>(null);
	const thirdRowRef = useRef<HTMLDivElement | null>(null);

	const refs = useMemo(() => [firstRowRef, secondRowRef, thirdRowRef], []);

	useEffect(() => {
		const tracks = [firstRowRef.current, secondRowRef.current, thirdRowRef.current];
		tracks.forEach((track, index) => {
			const trackValue = (track?.children[rows[0].length] as HTMLElement)?.offsetLeft;

			if (trackValue) {
				track?.style.setProperty("--scroll-from", index === 1 ? `${trackValue}px` : "0px");
				track?.style.setProperty("--scroll-to", index === 1 ? "0px" : `${-trackValue}px`);
			}
		});
	}, [trigger]);

	return (
		trigger && (
			<Box sx={styles.tracks} component={"section"}>
				<Stack direction={"column"} gap={2} alignItems={"center"} mb={"2rem"}>
					<Typography variant='h2' fontWeight={400}>
						Showcase
					</Typography>
					<Typography fontWeight={200} whiteSpace={"pre"} textAlign={"center"}>
						{`The plugin is ideal for absolutely all professions\nwho want to achieve great results by creating attractive and effective videos`}
					</Typography>
				</Stack>
				<Box sx={styles.box}>
					{rows.map((row, rowIndex) => {
						return (
							<Stack
								className='showcase-track'
								direction={"row"}
								gap={"1rem"}
								sx={{ animation: getAnimation(rowIndex), alignSelf: rowIndex === 1 ? "flex-end" : "flex-start" }}
								key={rowIndex}
								ref={refs[rowIndex]}
							>
								{[...row, ...row].map((source, index) => (
									<Wrapper variant='animated' angleOffset={index * 36} key={index} sx={{ borderRadius: "1rem" }}>
										<ElementCard name={source} />
									</Wrapper>
								))}
							</Stack>
						);
					})}
				</Box>
				<Link href={"/showcase"} passHref legacyBehavior>
					<Button variant='outlined' href='' sx={{ mt: "2rem" }}>
						View All
					</Button>
				</Link>
			</Box>
		)
	);
}
