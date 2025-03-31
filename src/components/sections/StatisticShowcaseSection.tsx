import { staticticItems } from "@/entities/statistic";
import { Box } from "@mui/material";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { Fragment } from "react";

export default function StatisticShowcase() {
	return (
		<Box
			component={"section"}
			sx={{
				display: "flex",
				width: "100%",
				maxWidth: "1280px",
				alignItems: "center",
				justifyContent: "center",
				py: "4rem"
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: { sm: "row", xs: "column" },
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					gap: "1rem"
				}}
			>
				{staticticItems.map((item, index) => {
					return (
						<Fragment key={item.id}>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									width: "100%",
									gap: "1rem",
									justifyContent: "center",
									alignItems: "center",
									padding: "0 2rem"
								}}
							>
								<Typography variant='h2' sx={{ fontWeight: "400" }}>
									{item.title}
								</Typography>
								<Typography textAlign={"center"} fontWeight={200}>
									{item.label}
								</Typography>
							</Box>
							{index < staticticItems.length - 1 && (
								<>
									<Divider flexItem orientation='vertical' sx={{ display: { sm: "flex", xs: "none" } }} />
									<Divider flexItem orientation='horizontal' sx={{ display: { sm: "none", xs: "flex" } }} />
								</>
							)}
						</Fragment>
					);
				})}
			</Box>
			{/* <Stack display={{ sm: "flex", xs: "none" }} direction='row' divider={<Divider flexItem orientation='vertical' />} spacing={2}>
				{staticticItems.map((item) => {
					return (
						<Box key={item.id} sx={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
							<Typography variant='h2' fontWeight={400}>
								{item.title}
							</Typography>
							<Typography textAlign={"center"} fontWeight={200}>
								{item.label}
							</Typography>
						</Box>
					);
				})}
			</Stack>
			<Stack display={{ sm: "none", xs: "flex" }} direction='column' divider={<Divider flexItem orientation='horizontal' />} spacing={2}>
				{staticticItems.map((item) => {
					return (
						<Box key={item.id} sx={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
							<Typography variant='h2' fontWeight={400}>
								{item.title}
							</Typography>
							<Typography textAlign={"center"} fontWeight={200}>
								{item.label}
							</Typography>
						</Box>
					);
				})}
			</Stack> */}
		</Box>
	);
}
