"use client";

import StyledLink from "@/components/ui/StyledLink";
import { TreeElement } from "@/lib/utils";
import { Breadcrumbs, Paper, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import HelpMenu from "./HelpMenu";
import { convertChunkToTypo, getBreadcrumbs } from "./utils";

interface PhoneBreadcrumbsProps {
	tree: TreeElement[];
}

export default function PhoneBreadcrumbs({ tree }: PhoneBreadcrumbsProps) {
	const pathname = usePathname();

	return (
		<Paper
			sx={{
				display: { xs: "flex", md: "none" },
				alignItems: "center",
				borderRadius: 0,
				py: "1rem"
			}}
			elevation={0}
		>
			<HelpMenu tree={tree} />
			<Breadcrumbs>
				{getBreadcrumbs(pathname).map((chunk, index, chunks) => {
					return index === chunks.length - 1 ? (
						<Typography color='primary'>{convertChunkToTypo(chunk)}</Typography>
					) : (
						<StyledLink href={`/${chunks.slice(0, index + 1).join("/")}`}>
							{convertChunkToTypo(chunk)}
						</StyledLink>
					);
				})}
			</Breadcrumbs>
		</Paper>
	);
}
