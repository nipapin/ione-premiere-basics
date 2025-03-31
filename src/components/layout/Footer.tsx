import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import X from "@mui/icons-material/X";
import YouTube from "@mui/icons-material/YouTube";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import StyledLink from "../ui/StyledLink";
import { Wrapper } from "./Wrapper";

type LinkItem = {
	id: number;
	label: string;
	href: string;
};

type SocialItem = {
	id: number;
	icon: React.ReactNode;
	href: string;
};

const AboutLinks: LinkItem[] = [
	{ id: 1, label: "Contact", href: "" },
	{ id: 2, label: "Blog", href: "" },
	{ id: 3, label: "Our Story", href: "" },
	{ id: 4, label: "Careers", href: "" }
];

const CompanyLinks: LinkItem[] = [
	{ id: 1, label: "Press", href: "" },
	{ id: 2, label: "Brand Assets", href: "" },
	{ id: 3, label: "Changelog", href: "" },
	{ id: 4, label: "Help center", href: "" }
];

const SocialLinks: SocialItem[] = [
	{ id: 1, href: "#", icon: <X /> },
	{ id: 2, href: "#", icon: <LinkedIn /> },
	{ id: 3, href: "#", icon: <Facebook /> },
	{ id: 4, href: "#", icon: <Instagram /> },
	{ id: 5, href: "#", icon: <YouTube /> }
];

export default function Footer() {
	return (
		<Box component={"footer"} maxWidth={"100vw"} borderTop={"1px solid var(--border)"} marginTop={"auto"}>
			<Wrapper fullWidth maxWidth={"xl"} py={{ xl: "4rem", xs: "2rem" }} px={{ xl: "2rem", xs: "1rem" }}>
				<Wrapper
					display={"flex"}
					justifyContent={"space-between"}
					alignItems={"center"}
					py={"2rem"}
					borderBottom={"1px solid var(--border)"}
					gap={"2rem"}
					sx={{ flexDirection: { md: "row", xs: "column" } }}
				>
					<Wrapper display={"flex"} flexDirection={"column"} gap={4} mx={0}>
						<Typography
							fontSize={{ xl: "2rem", md: "2rem", xs: "1.5rem" }}
							whiteSpace={"pre"}
						>{`Subscribe to get tips and tactics\nto grow the way you want.`}</Typography>
						<TextField
							placeholder='Your email adress'
							sx={{ position: "relative" }}
							slotProps={{
								input: {
									endAdornment: (
										<Button
											variant='contained'
											sx={{
												aspectRatio: 1,
												borderRadius: "1rem",
												position: "absolute",
												right: 0,
												top: "50%",
												transform: "translateY(-50%)"
											}}
										>
											<ArrowForwardIos />
										</Button>
									),
									sx: {
										borderRadius: "1rem",
										padding: "0.5rem 1rem"
									}
								}
							}}
						></TextField>
					</Wrapper>
					<Wrapper display={"grid"} gridTemplateColumns={"1fr 1fr"} gap={5} mx={0}>
						<Wrapper>
							<Typography marginBottom={"1rem"} fontWeight={700}>
								About
							</Typography>
							<Wrapper display={"flex"} flexDirection={"column"} gap={1}>
								{AboutLinks.map((link) => {
									return (
										<StyledLink key={link.id} href={link.href}>
											{link.label}
										</StyledLink>
									);
								})}
							</Wrapper>
						</Wrapper>
						<Wrapper>
							<Typography marginBottom={"1rem"} fontWeight={700}>
								Company
							</Typography>
							<Wrapper display={"flex"} flexDirection={"column"} gap={1}>
								{CompanyLinks.map((link) => {
									return (
										<StyledLink key={link.id} href={link.href}>
											{link.label}
										</StyledLink>
									);
								})}
							</Wrapper>
						</Wrapper>
					</Wrapper>
				</Wrapper>
				<Wrapper py={"2rem"} justifyContent={"space-between"} alignItems={"center"} sx={{ display: { xl: "flex", xs: "none" } }}>
					<Typography>© 2025 Premiere Basics</Typography>
					<Wrapper mx={0} width={"auto"}>
						{SocialLinks.map((link) => {
							return (
								<IconButton key={link.id} href={link.href}>
									{link.icon}
								</IconButton>
							);
						})}
					</Wrapper>
				</Wrapper>
				<Wrapper py={"2rem"} justifyContent={"space-between"} alignItems={"center"} sx={{ display: { xl: "none", xs: "flex" } }}>
					<Typography sx={{ fontSize: "0.8rem" }}>© 2025 Premiere Basics</Typography>
					<Wrapper mx={0} width={"auto"}>
						{SocialLinks.map((link) => {
							return (
								<IconButton size='small' key={link.id} href={link.href}>
									{link.icon}
								</IconButton>
							);
						})}
					</Wrapper>
				</Wrapper>
			</Wrapper>
		</Box>
	);
}
