import { staticticItems } from "@/entities/statistic";
import { Box } from "@mui/material";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function StatisticShowcase() {
	return (
		<Box
			component={"section"}
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				p: { sm: "8rem 0", xs: "2rem 0 4rem 0" }
			}}
		>
			<Stack display={{ sm: "flex", xs: "none" }} direction='row' divider={<Divider flexItem orientation='vertical' />} spacing={2}>
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
			</Stack>
		</Box>
	);
}
