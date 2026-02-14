import { Box, Typography } from "@mui/material";

export default function SettingsPage() {
	return (
		<Box sx={{ p: { xs: 2, md: 4 } }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
					Settings
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Admin panel settings
				</Typography>
			</Box>
			<Typography color="text.secondary">Settings page - coming soon</Typography>
		</Box>
	);
}
