import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import BlurredBox from "../ui/BlurredBox";
import LogoLink from "../ui/LogoLink";
import ScrollToTop from "../ui/ScrollToTop";
import MediumMenu from "./MediumMenu";
import NavBarLinks from "./NavBarLinks";
import SmallMenu from "./SmallMenu";
import { Wrapper } from "./Wrapper";

export default function NavBar() {
	return (
		<>
			<AppBar position='relative' elevation={0}>
				<Toolbar sx={{ zIndex: 1, background: "var(--background)" }}>
					<Wrapper
						fullWidth
						maxWidth={"xl"}
						display={"flex"}
						justifyContent={"space-between"}
						alignItems={"center"}
						py={"1rem"}
					>
						<Box display={"flex"} alignItems={"center"} gap={1}>
							<LogoLink />
							<MediumMenu />
						</Box>
						<SmallMenu />
						<NavBarLinks />
						<Stack
							direction={"row"}
							spacing={2}
							sx={{ display: { xs: "none", md: "flex" } }}
						>
							<Button variant='outlined' href='/login'>
								Log In
							</Button>
							<Button variant='contained' color='primary' href='/download'>
								Start now for free
							</Button>
						</Stack>
					</Wrapper>
				</Toolbar>
				<BlurredBox />
			</AppBar>
			<ScrollToTop />
		</>
	);
}
