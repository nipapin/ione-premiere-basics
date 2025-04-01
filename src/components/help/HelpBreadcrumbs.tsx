"use client";

import { NavigateNext } from "@mui/icons-material";
import { Breadcrumbs, capitalize, Link, Paper, Typography } from "@mui/material";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import MobileHelpMenu from "./MobileHelpMenu";

export default function HelpBreadcrumbs() {
	const pathname = usePathname();

	return (
		<Paper
			sx={{
				display: "flex",
				alignItems: "center",
				p: "1rem",
				background: "transparent",
				borderRadius: "0.5rem",
				gap: "1rem"
			}}
			variant='outlined'
		>
			<MobileHelpMenu />
			<Breadcrumbs separator={<NavigateNext fontSize='small' />} sx={{ "& p": { textWrap: "nowrap" } }}>
				{pathname
					.split("/")
					.filter(Boolean)
					.map((chunk: string, index: number, self: string[]) => {
						const text = capitalize(chunk.replace(/-/g, " "));
						const isLast = index === self.length - 1;
						return index === 0 ? (
							<NextLink href={"/help"} passHref legacyBehavior>
								<Link color='inherit' sx={{ textDecoration: "none" }}>
									<Typography key={chunk}>{text}</Typography>
								</Link>
							</NextLink>
						) : (
							<Typography key={chunk} sx={{ fontWeight: isLast ? 400 : 200 }}>
								{text}
							</Typography>
						);
					})}
			</Breadcrumbs>
		</Paper>
	);
}
