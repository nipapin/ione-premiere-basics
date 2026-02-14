import { ArrowForward, ErrorOutline } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";

export default function PaymentFailedPage() {
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
					"& h1, & p": {},
					textAlign: "center"
				}}
			>
				<div>
					<Typography fontSize={40} gutterBottom color='error.main' fontWeight={"bold"} width={"100%"}>
						Payment Failed <ErrorOutline sx={{ fontSize: "inherit", color: "error.main", verticalAlign: "top" }} />
					</Typography>
					<Typography variant='body1' fontWeight={"bold"} sx={{ whiteSpace: "pre", lineHeight: 1.1 }}>
						{`We're sorry, but your payment could not be processed at this time.\nPlease try again or contact our support team if the problem persists.`}
					</Typography>
				</div>

				<Box sx={{ display: "flex", gap: 2 }}>
					<Button variant='contained' color='primary' href='/pricing' endIcon={<ArrowForward />}>
						Go to Pricing
					</Button>
					<Button variant='outlined' color='primary' href='/contact'>
						Contact Support
					</Button>
				</Box>
			</Box>
		</Container>
	);
}
