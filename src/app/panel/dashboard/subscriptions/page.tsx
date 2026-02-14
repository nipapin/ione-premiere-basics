import { Box, Typography } from "@mui/material";

export default function SubscriptionsPage() {
	return (
		<Box sx={{ p: { xs: 2, md: 4 } }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
					Subscriptions
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Manage all subscriptions
				</Typography>
			</Box>
			<Typography color="text.secondary">Subscriptions page - coming soon</Typography>
		</Box>
	);
}
