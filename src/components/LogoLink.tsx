import Image from "next/image";
import StyledLink from "./StyledLink";
import Typography from "@mui/material/Typography";
import { Wrapper } from "./Wrapper";

export default function LogoLink() {
	return (
		<StyledLink href={"/"}>
			<Wrapper display={"flex"} alignItems={"center"} gap={1}>
				<Image src={"/images/odin.webp"} width={36} height={36} alt={"Odin Pro Extension by Premiere Basics"} />
				<Typography fontWeight={500} fontSize={"1.25rem"}>
					Odin Pro
				</Typography>
			</Wrapper>
		</StyledLink>
	);
}
