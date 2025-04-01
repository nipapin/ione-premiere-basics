import ArticleNavigation from "@/components/help/ArticleNavigation";
import HelpBreadcrumbs from "@/components/help/HelpBreadcrumbs";
import HelpMenu from "@/components/help/HelpMenu";
import PageContainer from "@/components/layout/PageContainer";
import TreeWrapper from "@/contexts/TreeWrapper";
import { getDocsTree } from "@/lib/utils";
import { Box } from "@mui/material";
import { ReactNode } from "react";

export default async function HelpLayout({ children }: { children: ReactNode }) {
	const tree = getDocsTree();

	return (
		<TreeWrapper tree={tree}>
			<PageContainer sx={{ pt: { xs: "2rem" } }}>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { lg: "300px 1fr 300px", md: "300px 1fr" },
						gap: "1rem",
						width: "100%",
						maxWidth: "xl",
						height: "100vh",
						overflow: "hidden"
					}}
				>
					<Box sx={{ position: "relative", py: "1rem", px: "1px", display: { md: "block", sm: "none", xs: "none" } }}>
						<HelpMenu />
					</Box>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: "1rem",
							p: { md: "1rem 2rem", sm: 0, xs: 0 },
							height: "100%",
							overflow: "auto",
							"&::-webkit-scrollbar": { display: "none" }
						}}
					>
						<HelpBreadcrumbs />
						{children}
					</Box>
					<Box sx={{ position: "relative", py: "1rem", display: { lg: "block", md: "none", sm: "none", xs: "none" } }}>
						<Box sx={{ position: "sticky", top: 0, right: 0, px: "1px" }}>
							<ArticleNavigation />
						</Box>
					</Box>
				</Box>
			</PageContainer>
		</TreeWrapper>
	);
}
