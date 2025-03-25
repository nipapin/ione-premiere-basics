import HeroPlayButton from "./HeroPlayButton";
import HeroVideo from "./HeroVideo";
import { Wrapper } from "./Wrapper";

export default function HeroVideoPlayer() {
	return (
		<Wrapper variant='animated'>
			<HeroPlayButton />
			<HeroVideo />
		</Wrapper>
	);
}
