"use client";

import { ArrowForward } from "@mui/icons-material";
import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentPage() {
	const { push } = useRouter();
	useEffect(() => {
		const checkStatus = async () => {
			const response = await fetch("/api/subscription/check");
			const data = await response.json();
			if (data.status === "active") {
				push("/payment/success");
			} else if (data.status === "failed") {
				push("/payment/failed");
			}
		};
		const interval = setInterval(checkStatus, 5000);
		return () => clearInterval(interval);
	}, []);

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
					gap: 2,
					mt: "-72px",
					textAlign: "center"
				}}
			>
				<CircularProgress size={50} />
				<Typography fontSize={40} fontWeight={"bold"} width={"100%"} color={"primary.main"}>
					Payment in process
				</Typography>
				<Typography variant='body1' sx={{ whiteSpace: "pre-line" }} gutterBottom>
					{`Your payment is being processed. Please wait a moment while we confirm your transaction.
                    You can close this page now. You will get an email when your subscription is active.`}
				</Typography>
				<NextLink href='/account' passHref>
					<Button variant='contained' color='primary' endIcon={<ArrowForward />}>
						Go to dashboard
					</Button>
				</NextLink>
			</Box>
		</Container>
	);
}
