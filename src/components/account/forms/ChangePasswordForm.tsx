"use client";

import { checkPassword, logout, sendUpdatePassword, updatePassword } from "@/actions/user";
import Preloader from "@/components/layout/Preloader";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Collapse,
	Divider,
	IconButton,
	TextField,
	Typography
} from "@mui/material";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export default function ChangePasswordForm() {
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [showValue, setShowValue] = useState(false);
	const [pending, setPending] = useState(false);
	const [matched, setMatched] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [redirecting, setRedirecting] = useState(false);
	const [error, setError] = useState(false);
	const router = useRouter();

	const validatePassword = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setPending(true);
		setError(false);
		const formData = new FormData(event.target as HTMLFormElement);
		const password = formData.get("password") as string;
		checkPassword(password).then((valid) => {
			setShowPasswordForm(valid);
			setError(!valid);
			setPending(false);
		});
	};

	const changeUserPassword = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const password = formData.get("password") as string;
		setPending(true);
		updatePassword(password).then(() => {
			setPending(false);
			setShowPasswordForm(false);
			setRedirecting(true);
			sendUpdatePassword(password)
			logout().then(() => {
				router.push("/login");
			});
		});
	};

	const handleChange = (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
		if (name === "password") {
			setNewPassword(event.target.value);
		} else {
			setConfirmPassword(event.target.value);
		}
	};

	useEffect(() => {
		if (confirmPassword !== "") setMatched(newPassword === confirmPassword);
	}, [newPassword, confirmPassword]);

	return (
		<Box>
			{redirecting && <Preloader />}
			<Typography variant='h2' sx={{ fontSize: "1.2rem", pt: "1rem" }}>
				Change Password
			</Typography>
			<Typography sx={{ fontSize: "1rem", pt: "1rem", fontWeight: 200 }}>
				Type your current password to change it.
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Typography sx={{ my: "1rem" }}>Current password</Typography>
			<Box
				component={"form"}
				onSubmit={validatePassword}
				sx={{ display: "flex", flexDirection: { lg: "row", xs: "column" }, gap: "1rem", alignItems: "stretch" }}
			>
				<TextField
					variant='outlined'
					type={showValue ? "text" : "password"}
					fullWidth
					slotProps={{
						input: {
							sx: { borderRadius: "0.5rem" },
							endAdornment: (
								<IconButton onClick={() => setShowValue(!showValue)}>
									{showValue ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							)
						}
					}}
					name='password'
				/>
				{!showPasswordForm && (
					<Button variant='contained' type='submit' sx={{ borderRadius: "0.5rem" }}>
						{pending ? <CircularProgress size={20} color='inherit' /> : "Confirm"}
					</Button>
				)}
			</Box>
			{error && (
				<Alert severity='error' sx={{ mt: "1rem", alignItems: "center" }}>
					<Typography>Invalid password</Typography>
				</Alert>
			)}
			<Collapse in={showPasswordForm} unmountOnExit>
				<Box component={"form"} onSubmit={changeUserPassword}>
					<Box sx={{ display: "grid", gridTemplateColumns: { lg: "1fr 1fr", xs: "1fr" }, gap: "1rem", pt: "1rem" }}>
						<Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
							<Typography>New Password</Typography>
							<TextField
								variant='outlined'
								fullWidth
								slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
								name='password'
								required
								onChange={handleChange("password")}
							/>
						</Box>
						<Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
							<Typography>Confirm new password</Typography>
							<TextField
								variant='outlined'
								fullWidth
								slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
								name='confirmpassword'
								required
								onChange={handleChange("confirmpassword")}
							/>
						</Box>
					</Box>
					<Button
						disabled={!matched}
						fullWidth
						variant='contained'
						sx={{ borderRadius: "0.5rem", mt: "1rem" }}
						type='submit'
					>
						{pending ? <CircularProgress size={20} color='inherit' /> : "Change password"}
					</Button>
				</Box>
			</Collapse>
		</Box>
	);
}
