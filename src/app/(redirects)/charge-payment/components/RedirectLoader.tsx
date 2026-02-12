"use client";

import { useUser } from "@/contexts/UserWrapper";
import { plans } from "@/entities/plans";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect } from "react";

const boxStyles = {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	gap: 2,
	height: "100vh",
	width: "100vw",
	position: "fixed",
	top: 0,
	left: 0,
	zIndex: 1000,
	backgroundColor: "background.default",
};

export default function RedirectLoader({ productID, affilate }: { productID: string; affilate: string }) {
	const { user } = useUser();
	const isFreePlan = productID === plans[0].id[0].toString();
	const redirectURL = isFreePlan
		? `/download`
		: `https://store.payproglobal.com/checkout?products[1][id]=${productID}&page-template=20409&currency=USD&billing-first-name=${user?.name}&billing-last-name=${user?.lastname}&billing-email=${user?.email}&x-odin-user-id=${user?.user_id}&x-odin-affiliate=${affilate}`;

	useEffect(() => {
		window.location.href = redirectURL;
	}, [redirectURL]);

	return (
		<Box sx={boxStyles}>
			<CircularProgress size={40} />
			<Typography variant="h6">Please wait while we redirect you to the payment page...</Typography>
		</Box>
	);
}
