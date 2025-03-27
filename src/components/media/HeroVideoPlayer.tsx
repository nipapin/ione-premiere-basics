import HeroPlayButton from "../ui/HeroPlayButton";
import HeroVideo from "./HeroVideo";
import { Wrapper } from "../layout/Wrapper";

export default function HeroVideoPlayer() {
	return (
		<Wrapper variant='animated'>
			<HeroPlayButton />
			<HeroVideo />
		</Wrapper>
	);
}
