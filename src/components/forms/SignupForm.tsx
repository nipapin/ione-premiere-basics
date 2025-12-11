"use client";

import { create, isExist, sendConfirmationEmail } from "@/actions/user";
import { setCsrfToken } from "@/lib/csrf";
import { Home, Visibility, VisibilityOff } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Collapse,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Typography,
} from "@mui/material";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import { styles } from "./LoginForm";

interface SignupFormData {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

interface PasswordFieldProps {
	show: boolean;
	onToggleVisibility: () => void;
	name: string;
	placeholder: string;
}

const PasswordField = ({ show, onToggleVisibility, name, placeholder }: PasswordFieldProps) => (
	<TextField
		required
		placeholder={placeholder}
		type={show ? "text" : "password"}
		slotProps={{
			input: {
				sx: { borderRadius: "1rem" },
				endAdornment: <IconButton onClick={onToggleVisibility}>{show ? <VisibilityOff /> : <Visibility />}</IconButton>,
				name,
			},
		}}
		fullWidth
	/>
);

const ErrorAlert = ({ message }: { message: string }) => (
	<Collapse in={!!message}>
		<Alert severity="error" sx={{ alignItems: "center" }}>
			<Typography>{message}</Typography>
		</Alert>
	</Collapse>
);

const SubmitButton = ({ isLoading }: { isLoading: boolean }) => (
	<Button
		variant="contained"
		sx={{
			mt: "auto",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			gap: "1rem",
		}}
		type="submit"
	>
		<Typography>Sign Up</Typography>
		{isLoading && <CircularProgress size="1rem" color="inherit" />}
	</Button>
);

export default function SignupForm({ after, referal_code }: { after?: string; referal_code?: string }) {
	const referalUser = Buffer.from(referal_code || "", "base64").toString("utf-8");
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [csrfToken, setCsrfTokenState] = useState("");
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [email, setEmail] = useState<string>(referalUser || "");

	useEffect(() => {
		// Generate a random token for CSRF protection
		const token = Math.random().toString(36).substring(2);
		setCsrfTokenState(token);
		setCsrfToken(token);
	}, []);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage("");
		setIsLoading(true);

		const formData = new FormData(event.currentTarget);
		const formValues: SignupFormData = {
			name: formData.get("name") as string,
			email: (formData.get("email") as string) || referalUser,
			password: formData.get("password") as string,
			confirmPassword: formData.get("confirmpassword") as string,
		};

		if (formValues.password !== formValues.confirmPassword) {
			setErrorMessage("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (await isExist(formValues.email)) {
			setErrorMessage("Email already exists");
			setIsLoading(false);
			return;
		}

		try {
			const user = await create(
				formValues.name.trim(),
				formValues.email.toLowerCase().trim(),
				formValues.password,
				csrfToken
			);
			if (user) {
				await sendConfirmationEmail(formValues.email, user.confirmtoken!);
				setEmail(formValues.email);
				setShowSuccessMessage(true);
			}
		} catch (error) {
			console.log("Signup error:", error);
			setErrorMessage("An error occurred during signup");
		}
	};

	return (
		<Wrapper variant="animated" sx={styles.wrapper}>
			<Box sx={styles.box} component="form" onSubmit={handleSubmit}>
				<Link href="/" passHref>
					<IconButton
						sx={{
							borderRadius: "0.5rem",
							border: "1px solid #ffffff20",
							minWidth: 0,
							width: "fit-content",
						}}
					>
						<Home />
					</IconButton>
				</Link>

				<Typography
					variant="h1"
					fontSize="3rem"
					pb="2rem"
					width="100%"
					textAlign="center"
					sx={{ "& span": { fontWeight: 400, textWrap: "nowrap" } }}
				>
					Welcome to <span>Odin Pro</span>
				</Typography>

				<TextField
					placeholder="First Name"
					required
					slotProps={{
						input: { sx: { borderRadius: "1rem" }, name: "name" },
					}}
					fullWidth
				/>

				<TextField
					placeholder="E-mail"
					required
					disabled={!!referalUser}
					defaultValue={email}
					slotProps={{
						input: { sx: { borderRadius: "1rem" }, name: "email" },
					}}
					fullWidth
				/>

				<PasswordField
					show={showPassword}
					onToggleVisibility={() => setShowPassword(!showPassword)}
					name="password"
					placeholder="Password"
				/>

				<PasswordField
					show={showPassword}
					onToggleVisibility={() => setShowPassword(!showPassword)}
					name="confirmpassword"
					placeholder="Confirm Password"
				/>

				<ErrorAlert message={errorMessage} />
				<SubmitButton isLoading={isLoading} />

				<Link href={`/login${after ? `?after=${after}` : ""}`} passHref>
					<Button component="span" variant="outlined" fullWidth>
						<Typography textAlign={"center"}>Already have an account? Log In</Typography>
					</Button>
				</Link>
			</Box>
			<Dialog
				open={showSuccessMessage}
				slotProps={{ paper: { sx: { background: "var(--background-gradient)", minWidth: "20rem" }, elevation: 0 } }}
			>
				<DialogTitle>Success</DialogTitle>
				<DialogContent>
					<Typography gutterBottom>Your account has been created successfully</Typography>
					<Typography sx={{ "& span": { color: "var(--primary)" } }}>
						Please check your email <br /> <span>{email}</span> for verification
					</Typography>
				</DialogContent>
			</Dialog>
		</Wrapper>
	);
}
