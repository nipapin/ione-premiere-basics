"use client";

import { logout, sendUpdateEmail } from "@/actions/user";
import Preloader from "@/components/layout/Preloader";
import { useUser } from "@/contexts/UserWrapper";
import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ChangeEmailForm() {
	const user = useUser();
	const [pending, setPending] = useState(false);
	const [redirecting, setRedirecting] = useState(false);
	const [error, setError] = useState(false);
	const router = useRouter();

	const changeUserEmail = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setPending(true);
		setError(false);
		const formData = new FormData(event.target as HTMLFormElement);
		const email = formData.get("email") as string;
		sendUpdateEmail(user?.email || "", email).then((success) => {
			if (success) {
				setRedirecting(true);
				logout().then(() => {
					router.push("/login");
				});
			} else {
				setError(true);
				setPending(false);
			}
		});
	};

	return (
		<Box>
			{redirecting && <Preloader />}
			<Alert severity='error' sx={{ display: error ? "flex" : "none", alignItems: "center" }}>
				<Typography>User with this email already exists</Typography>
			</Alert>
			<Typography sx={{ my: "1rem" }}>Email</Typography>
			<Box
				component={"form"}
				onSubmit={changeUserEmail}
				sx={{
					display: "grid",
					gridTemplateColumns: { lg: "3fr 1fr", xs: "1fr" },
					gap: "1rem",
					width: "100%",
					my: "1rem",
					alignItems: "center"
				}}
			>
				<TextField
					variant='outlined'
					fullWidth
					defaultValue={""}
					slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
					name='email'
					placeholder={user?.email || ""}
				/>
				<Button
					variant='contained'
					sx={{
						borderRadius: "0.5rem",
						height: "calc(100% - 4px)"
					}}
					type={"submit"}
				>
					{pending ? <CircularProgress size={20} color='inherit' /> : "Change Email"}
				</Button>
			</Box>
			<Alert severity='warning' sx={{ alignItems: "center" }}>
				<Typography>
					When you change your email, you will be logged out and need to confirm your new email address.
				</Typography>
			</Alert>
		</Box>
	);
}
