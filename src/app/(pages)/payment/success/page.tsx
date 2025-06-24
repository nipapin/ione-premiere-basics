import { ArrowForward, CheckCircle } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";

export default function PaymentSuccessPage() {
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
						Payment Successful <CheckCircle sx={{ fontSize: "inherit", color: "success.main", verticalAlign: "top" }} />
					</Typography>
					<Typography variant='body1' fontWeight={"bold"} sx={{ whiteSpace: "pre", lineHeight: 1.1 }}>
						{`Thank you for your purchase! Your payment has been processed successfully.\nYou can now download your product or access your account.`}
					</Typography>
				</div>

				<Box sx={{ display: "flex", gap: 2 }}>
					<Button variant='contained' color='primary' href='/download' endIcon={<ArrowForward />}>
						Download Product
					</Button>
					<Button variant='outlined' color='primary' href='/account'>
						Go to Dashboard
					</Button>
				</Box>
			</Box>
		</Container>
	);
}
