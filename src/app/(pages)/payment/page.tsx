"use client";

import { Box, CircularProgress, Container, Typography } from "@mui/material";
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
					gap: 4,
					mt: "-72px",
					textAlign: "center"
				}}
			>
				<Typography fontSize={40} gutterBottom fontWeight={"bold"} width={"100%"}>
					Payment in process...
				</Typography>
				<CircularProgress size={50} />
			</Box>
		</Container>
	);
}
