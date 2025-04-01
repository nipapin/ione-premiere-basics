import ArticleNavigation from "@/components/help/ArticleNavigation";
import HelpMenu from "@/components/help/HelpMenu";
import PageContainer from "@/components/layout/PageContainer";
import { getDocsTree } from "@/lib/utils";
import { Box } from "@mui/material";
import { ReactNode } from "react";

export default async function HelpLayout({ children }: { children: ReactNode }) {
	return (
		<PageContainer>
			<Box
				sx={{
					display: { md: "grid", sm: "none" },
					gridTemplateColumns: { md: "300px 1fr 300px", sm: "300px 1fr" },
					gap: "1rem",
					width: "100%",
					maxWidth: "xl",
					height: "100vh",
					overflow: "hidden",
				}}
			>
				<Box sx={{ position: "relative", py: "1rem" }}>
					<HelpMenu tree={getDocsTree()} />
				</Box>
				{children}
				<Box sx={{ position: "relative", py: "1rem", display: { md: "block", sm: "none" } }}>
					<Box sx={{ position: "sticky", top: 0, right: 0 }}>
						<ArticleNavigation />
					</Box>
				</Box>
			</Box>
		</PageContainer>
	);
}
