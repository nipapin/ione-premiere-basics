"use client";

import { ArrowForward } from "@mui/icons-material";
import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentPage() {
	const { replace } = useRouter();
	const [state, setState] = useState<"checking" | "delayed" | "error">("checking");
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		let stopped = false, pending = false, failures = 0;
		setState("checking");
		const stop = () => {
			stopped = true;
			clearInterval(interval);
			clearTimeout(deadline);
			controller.abort();
		};
		const checkStatus = async () => {
			if (stopped || pending) return;
			pending = true;
			try {
				const response = await fetch("/api/subscription/check", { cache: "no-store", signal: controller.signal });
				const data = await response.json();
				if (stopped) return;
				if (response.ok && data.status === "active") {
					stop();
					replace("/payment/success");
				} else if (response.ok && data.status === "failed") {
					stop();
					replace("/payment/failed");
				} else if (!response.ok && response.status !== 404) {
					throw new Error("Unable to check payment");
				}
				failures = 0;
			} catch {
				if (!stopped && ++failures >= 3) {
					stop();
					setState("error");
				}
			} finally { pending = false; }
		};
		const interval = setInterval(checkStatus, 5000);
		const deadline = setTimeout(() => { stop(); setState("delayed"); }, 120000);
		void checkStatus();
		return stop;
	}, [replace, attempt]);

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
				{state === "checking" && <CircularProgress size={50} />}
				<Typography fontSize={40} fontWeight={"bold"} width={"100%"} color={"primary.main"}>
					{state === "checking" ? "Payment in process" : state === "delayed" ? "Payment confirmation is taking longer" : "Unable to check payment status"}
				</Typography>
				<Typography variant='body1' sx={{ whiteSpace: "pre-line" }} gutterBottom>
					{state === "checking"
						? "We are waiting for PayPro to confirm your purchase and activate your subscription."
						: "Your subscription has not been confirmed yet. Check again or contact support with your PayPro order number and purchase email. Please do not pay again."}
				</Typography>
				{state !== "checking" && <Button variant="outlined" onClick={() => setAttempt(value => value + 1)}>Check again</Button>}
				<NextLink href='/account' passHref>
					<Button variant='contained' color='primary' endIcon={<ArrowForward />}>
						Go to dashboard
					</Button>
				</NextLink>
			</Box>
		</Container>
	);
}
