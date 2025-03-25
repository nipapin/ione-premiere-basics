import { DetailedHTMLProps, VideoHTMLAttributes } from "react";

export default function HeroVideo(
	props: DetailedHTMLProps<
		VideoHTMLAttributes<HTMLVideoElement>,
		HTMLVideoElement
	>
) {
	return (
		<video
			loop
			muted
			playsInline
			autoPlay
			width={1280}
			height={720}
			poster='/images/cover-poster.webp'
			src='/videos/cover.mp4'
			{...props}
			style={{ width: "100%", height: "auto" }}
		/>
	);
}
