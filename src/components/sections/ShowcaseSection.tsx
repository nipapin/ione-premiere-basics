"use client";

import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Wrapper } from "../layout/Wrapper";

const createRow = (...args: string[]) => [...args];

const rows: string[][] = [
	createRow("element_1", "element_1", "element_1", "element_1", "element_1"),
	createRow("element_1", "element_1", "element_1", "element_1", "element_1"),
	createRow("element_1", "element_1", "element_1", "element_1", "element_1")
];

const styles = {
	tracks: {
		overflow: "hidden",
		whiteSpace: "nowrap",
		position: "relative",
		width: "70vw",
		py: "2rem",
		px: "2px",
		display: { xl: "flex", xs: "none" },
		flexDirection: "column",
		gap: "1rem",
		"--border-radius": "1rem",
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
			zIndex: 1,
			pointerEvents: "none"
		}
	}
};

const getAnimation = (index: number) =>
	index === 1
		? "scroll-logo 120s linear infinite reverse"
		: "scroll-logo 120s linear infinite";

export default function Showcase() {
	const firstRowRef = useRef<HTMLDivElement | null>(null);
	const secondRowRef = useRef<HTMLDivElement | null>(null);
	const thirdRowRef = useRef<HTMLDivElement | null>(null);

	const refs = [firstRowRef, secondRowRef, thirdRowRef];

	useEffect(() => {
		const tracks = [
			firstRowRef.current,
			secondRowRef.current,
			thirdRowRef.current
		];
		const trackValue = (tracks[0]?.children[rows[0].length] as HTMLElement)
			.offsetLeft;
		tracks.forEach((track, index) => {
			track?.style.setProperty("--scroll-to", `${-trackValue}px`);
		});
	}, []);

	return (
		<Box sx={styles.tracks}>
			<Stack direction={"column"} gap={2} alignItems={"center"} mb={"2rem"}>
				<Typography variant='h2' fontWeight={400}>
					Showcase
				</Typography>
				<Typography
					fontWeight={200}
					whiteSpace={"pre"}
					textAlign={"center"}
				>{`The plugin is ideal for absolutely all professions\nwho want to achieve great results by creating attractive and effective videos`}</Typography>
			</Stack>
			{rows.map((row, rowIndex) => {
				return (
					<Stack
						direction={"row"}
						gap={"1rem"}
						sx={{ animation: getAnimation(rowIndex) }}
						key={rowIndex}
						ref={refs[rowIndex]}
					>
						{[...row, ...row].map((source, index, self) => (
							<Wrapper
								variant='animated'
								angleOffset={index * (360 / self.length)}
								key={index}
								sx={{ borderRadius: "1rem" }}
							>
								<ElementCard key={index} name={source} />
							</Wrapper>
						))}
					</Stack>
				);
			})}
		</Box>
	);
}

const ElementCard = ({ name }: { name: string }) => {
	const [play, setPlay] = useState<boolean>(false);

	const togglePlay =
		(state: boolean) => (event: MouseEvent<HTMLDivElement>) => {
			setPlay(state);
			if (state) {
				const video = event.currentTarget.children[0] as HTMLVideoElement;
				video.currentTime = 0;
				video.play();
			}
		};

	return (
		<Stack onMouseEnter={togglePlay(true)} onMouseLeave={togglePlay(false)}>
			<video
				src={`/videos/graphics/${name}.webm`}
				className={play ? "" : "hidden"}
				muted
				loop
				width={256}
				height={144}
			/>
			<Image
				src={`/images/graphics/${name}.webp`}
				alt={name}
				className={play ? "hidden" : ""}
				width={256}
				height={144}
			/>
		</Stack>
	);
};
