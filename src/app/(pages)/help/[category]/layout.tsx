import HelpMenu from "@/components/help/HelpMenu";
import { getDocsTree } from "@/lib/utils";
import { Stack } from "@mui/material";
import { ReactNode } from "react";

export default async function HelpLayout({
	children
}: {
	children: ReactNode;
}) {
	return (
		<Stack maxWidth={"100vw"} minHeight={"100vh"}>
			<HelpMenu tree={getDocsTree()} />
			{children}
		</Stack>
	);
}
