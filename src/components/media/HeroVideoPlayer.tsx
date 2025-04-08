import HeroPlayButton from "../ui/HeroPlayButton";
import HeroVideo from "./HeroVideo";
import { Wrapper } from "../layout/Wrapper";

export default function HeroVideoPlayer() {
	return (
		<Wrapper variant='animated' sx={{ p: '1px' }}>
			<HeroPlayButton />
			<HeroVideo />
		</Wrapper>
	);
}
