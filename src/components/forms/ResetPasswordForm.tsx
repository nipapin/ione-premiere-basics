"use client";

import { confirmResetPassword, sendResetPasswordEmail, updatePassword } from "@/actions/user";
import { Wrapper } from "@/components/layout/Wrapper";
import StyledLink from "@/components/ui/StyledLink";
import { Home } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Collapse, IconButton, TextField, Typography } from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string>();
	const { push } = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(undefined);
		if (showPassword) {
			const formData = new FormData(e.target as HTMLFormElement);
			const password = formData.get("password") as string;
			const email = formData.get("email") as string;
			setIsLoading(true);
			const success = await updatePassword(password, email);
			if (success) {
				push("/login");
			} else {
				setError("Error while update password");
			}
		} else if (!open) {
			const formData = new FormData(e.target as HTMLFormElement);
			const email = formData.get("email") as string;
			setIsLoading(true);
			const success = await sendResetPasswordEmail(email.toLowerCase().trim());
			if (!success) {
				setError("Failed to send reset password email");
				return;
			}
			setIsLoading(false);
			setOpen(success);
		} else {
			const formData = new FormData(e.target as HTMLFormElement);
			const confirmationCode = formData.get("confirmationCode") as string;
			const email = formData.get("email") as string;
			setIsLoading(true);
			const success = await confirmResetPassword(email.toLowerCase().trim(), confirmationCode);
			if (!success) {
				setError("Failed to confirm reset password");
			}
			setIsLoading(false);
			setOpen(false);
			setShowPassword(success);
		}
	};

	return (
		<Wrapper
			variant="animated"
			sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", maxWidth: "600px" }}
			fullWidth
		>
			<Box
				sx={{
					width: "100%",
					p: "2rem",
					background: "var(--background-gradient)",
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
				}}
				component={"form"}
				onSubmit={handleSubmit}
			>
				<NextLink href="/" passHref>
					<IconButton sx={{ borderRadius: "0.5rem", border: "1px solid #ffffff20", minWidth: 0, width: "fit-content" }}>
						<Home />
					</IconButton>
				</NextLink>
				<Typography variant="h1" fontSize={"2rem"} width={"100%"} textAlign={"center"}>
					Reset Password
				</Typography>

				<TextField
					placeholder="E-mail"
					required
					disabled={isLoading}
					slotProps={{
						input: { sx: { borderRadius: "1rem" }, name: "email" },
					}}
					fullWidth
				/>
				<Collapse in={open} unmountOnExit>
					<TextField
						placeholder="Confirmation Code"
						required
						disabled={isLoading}
						slotProps={{
							input: { sx: { borderRadius: "1rem" }, name: "confirmationCode" },
						}}
						fullWidth
					/>
				</Collapse>
				<Collapse in={showPassword} unmountOnExit>
					<TextField
						placeholder="New Password"
						required
						disabled={isLoading}
						slotProps={{
							input: { sx: { borderRadius: "1rem" }, name: "password" },
						}}
						fullWidth
					/>
				</Collapse>
				{error && (
					<Alert severity="error" sx={{ alignItems: "center" }}>
						<Typography width={"100%"} color={"error"}>
							{error}
						</Typography>
					</Alert>
				)}
				<Button
					variant="contained"
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "1rem",
						borderRadius: "1rem",
					}}
					disabled={isLoading}
					type="submit"
					fullWidth
				>
					<Typography>{open ? "Confirm Code" : showPassword ? "Update Password" : "Send Reset Link"}</Typography>
					{isLoading && <CircularProgress size={16} color="inherit" />}
				</Button>
				<Typography mt={"1rem"} textAlign={"center"} width={"100%"}>
					Remember your password? <StyledLink href={"/login"}>Log In</StyledLink>
				</Typography>
			</Box>
		</Wrapper>
	);
}
