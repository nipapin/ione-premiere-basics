"use client";

import { logout } from "@/actions/user";
import { useUser } from "@/contexts/UserWrapper";
import { Logout } from "@mui/icons-material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BlurredBox from "../ui/BlurredBox";
import LogoLink from "../ui/LogoLink";
import ScrollToTop from "../ui/ScrollToTop";
import MediumMenu from "./MediumMenu";
import NavBarLinks from "./NavBarLinks";
import SmallMenu from "./SmallMenu";
import { Wrapper } from "./Wrapper";

export default function NavBar() {
	const user = useUser();
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		if (pathname?.includes("/account")) router.push("/");
	};

	return (
		<>
			<AppBar position='relative' elevation={0}>
				<Collapse in={!["/login", "/signup", "/confirm-email", "/reset-password"].includes(pathname ?? "")}>
					<Toolbar sx={{ zIndex: 1, background: "var(--background)" }}>
						<Wrapper
							fullWidth
							maxWidth={"xl"}
							display={"flex"}
							justifyContent={{ xl: "center", md: "space-between" }}
							alignItems={"center"}
							py={"1rem"}
						>
							<Box display={"flex"} alignItems={"center"} gap={1} sx={{ width: { sm: "auto", md: "300px" } }}>
								<LogoLink />
								<MediumMenu />
							</Box>
							<SmallMenu />
							<Box sx={{ flex: { xl: 1, md: 0 }, display: { xl: "flex", md: "none" }, justifyContent: "center" }}>
								<NavBarLinks />
							</Box>
							<Stack
								direction={"row"}
								spacing={2}
								sx={{
									display: { xs: "none", md: "flex" },
									width: { md: "auto", xl: "300px" },
									justifyContent: "flex-end"
								}}
							>
								{user ? (
									<>
										<Link href={"/account"} passHref legacyBehavior>
											<Button variant='contained' href=''>
												Account
											</Button>
										</Link>
										<IconButton onClick={handleLogout}>
											<Logout />
										</IconButton>
									</>
								) : (
									<>
										<Button variant='outlined' href='/login'>
											Log In
										</Button>
										<Button variant='contained' color='primary' href='/download'>
											Start now for free
										</Button>
									</>
								)}
							</Stack>
						</Wrapper>
					</Toolbar>
				</Collapse>
				<BlurredBox />
			</AppBar>
			<ScrollToTop />
		</>
	);
}
