"use client";

import { confirmAccount } from "@/actions/user";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectMesssage({ token }: { token: string }) {
	const { push } = useRouter();

	useEffect(() => {
		confirmAccount(token).then((res) => {
			if (res) {
				push("/login");
			} else {
				push("/");
			}
		});
	}, [token, push]);

	return (
		<Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
			<Typography variant='h1' fontSize={"2rem"} gutterBottom mt={"-15rem"}>
				Thanks for confirmation
			</Typography>
			<Typography fontWeight={200}>{`Please wait while we log you into your account. This won't take long!`}</Typography>
		</Box>
	);
}
