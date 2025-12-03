import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import Instagram from "@mui/icons-material/Instagram";
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
	{ id: 1, label: "Features", href: "/features" },
	{ id: 2, label: "Pricing", href: "/pricing" },
	{ id: 3, label: "Download", href: "/download" },
	// { id: 4, label: "Blog", href: "/blog" },
	{ id: 5, label: "Help", href: "/help" },
];

const CompanyLinks: LinkItem[] = [{ id: 4, label: "Help center", href: "/help" }];

const SocialLinks: SocialItem[] = [
	{ id: 1, href: "https://instagram.com/tymon_reynders", icon: <Instagram /> },
	{ id: 2, href: "https://www.youtube.com/@PremiereBasics", icon: <YouTube /> },
];

const TermsLinks: LinkItem[] = [
	{ id: 1, label: "Privacy Policy", href: "/privacy-policy" },
	{ id: 2, label: "Terms of Service", href: "/terms-of-service" },
	{ id: 3, label: "Refund Policy", href: "/refund-policy" },
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
						>{`Subscribe to get the latest\nnews and updates`}</Typography>
						<TextField
							placeholder="Your email adress"
							sx={{ position: "relative" }}
							slotProps={{
								input: {
									endAdornment: (
										<Button
											variant="contained"
											sx={{
												aspectRatio: 1,
												borderRadius: "1rem",
												position: "absolute",
												right: 0,
												top: "50%",
												transform: "translateY(-50%)",
											}}
										>
											<ArrowForwardIos />
										</Button>
									),
									sx: {
										borderRadius: "1rem",
										padding: "0.5rem 1rem",
									},
								},
							}}
						></TextField>
					</Wrapper>
					<Wrapper display={"grid"} gridTemplateColumns={"1fr 1fr"} gap={5} mx={0}>
						<Wrapper>
							<Typography marginBottom={"1rem"} fontWeight={700}>
								Pages
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
								Terms
							</Typography>
							<Wrapper display={"flex"} flexDirection={"column"} gap={1}>
								{TermsLinks.map((link) => {
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
				<Wrapper
					py={"2rem"}
					justifyContent={"space-between"}
					alignItems={"center"}
					sx={{ display: { xl: "flex", xs: "none" } }}
				>
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
				<Wrapper
					py={"2rem"}
					justifyContent={"space-between"}
					alignItems={"center"}
					sx={{ display: { xl: "none", xs: "flex" } }}
				>
					<Typography sx={{ fontSize: "0.8rem" }}>© 2025 Premiere Basics</Typography>
					<Wrapper mx={0} width={"auto"}>
						{SocialLinks.map((link) => {
							return (
								<IconButton size="small" key={link.id} href={link.href} target="_blank">
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
