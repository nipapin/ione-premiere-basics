import { Button, Typography } from "@mui/material";

import { Box, Container } from "@mui/material";

export default function PaymentWaitingPage() {
	return (
		<Container maxWidth='lg'>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					width: "100%",
					height: "100vh",
					gap: 4,
					mt: "-72px",
					textAlign: "center"
				}}
			>
				<div>
					<Typography fontSize={40} gutterBottom color='success.main' fontWeight={"bold"} width={"100%"}>
						Please Wait
					</Typography>
					<Typography variant='body1' fontWeight={"bold"} sx={{ whiteSpace: "pre", lineHeight: 1.1 }}>
						{`Thank you for your purchase! Your payment has been accepted but we need to wait for the payment to be processed.\nYou can close this page now. You will get an email when your subscription is active.`}
					</Typography>
				</div>

				<Box sx={{ display: "flex", gap: 2 }}>
					<Button variant='outlined' color='primary' href='/account'>
						Go to Dashboard
					</Button>
				</Box>
			</Box>
		</Container>
	);
}
