"use client";

import { rows, styles } from "@/entities/showcases";
import { Box, Button, Stack, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Wrapper } from "../layout/Wrapper";

const getAnimation = (index: number) => (index === 1 ? "scroll-logo 120s linear infinite reverse" : "scroll-logo 120s linear infinite");

export default function Showcase() {
	const firstRowRef = useRef<HTMLDivElement | null>(null);
	const secondRowRef = useRef<HTMLDivElement | null>(null);
	const thirdRowRef = useRef<HTMLDivElement | null>(null);

	const refs = [firstRowRef, secondRowRef, thirdRowRef];

	useEffect(() => {
		const tracks = [firstRowRef.current, secondRowRef.current, thirdRowRef.current];
		const trackValue = (tracks[0]?.children[rows[0].length] as HTMLElement).offsetLeft;
		tracks.forEach((track) => {
			track?.style.setProperty("--scroll-to", `${-trackValue}px`);
		});
	}, []);

	return (
		<Box sx={styles.tracks} component={"section"}>
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
			<Box sx={styles.box}>
				{rows.map((row, rowIndex) => {
					return (
						<Stack direction={"row"} gap={"1rem"} sx={{ animation: getAnimation(rowIndex) }} key={rowIndex} ref={refs[rowIndex]}>
							{[...row, ...row, ...row].map((source, index, self) => (
								<Wrapper variant='animated' angleOffset={index * (360 / self.length)} key={index} sx={{ borderRadius: "1rem" }}>
									<ElementCard key={index} name={source} />
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
	);
}

const ElementCard = ({ name }: { name: string }) => {
	const [play, setPlay] = useState<boolean>(false);

	const togglePlay = (state: boolean) => (event: MouseEvent<HTMLDivElement>) => {
		setPlay(state);
		if (state) {
			const video = event.currentTarget.children[0] as HTMLVideoElement;
			video.currentTime = 0;
			video.play();
		}
	};

	return (
		<Stack onMouseEnter={togglePlay(true)} onMouseLeave={togglePlay(false)}>
			<video src={`/videos/graphics/${name}.webm`} className={play ? "" : "hidden"} muted loop width={256} height={144} />
			<Image src={`/images/graphics/${name}.webp`} alt={name} className={play ? "hidden" : ""} width={256} height={144} />
		</Stack>
	);
};
