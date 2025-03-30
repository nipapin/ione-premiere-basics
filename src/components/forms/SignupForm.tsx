"use client";

import { create, isExist } from "@/actions/user";
import { Home, Visibility, VisibilityOff } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Collapse, IconButton, TextField, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import StyledLink from "../ui/StyledLink";
import { styles } from "./LoginForm";
import Link from "next/link";
import { setCsrfToken } from "@/lib/csrf";

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
				name
			}
		}}
		fullWidth
	/>
);

const ErrorAlert = ({ message }: { message: string }) => (
	<Collapse in={!!message}>
		<Alert severity='error' sx={{ alignItems: "center" }}>
			<Typography>{message}</Typography>
		</Alert>
	</Collapse>
);

const SubmitButton = ({ isLoading }: { isLoading: boolean }) => (
	<Button
		variant='contained'
		sx={{
			mt: "auto",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			gap: "1rem"
		}}
		type='submit'
	>
		<Typography>Sign Up</Typography>
		{isLoading && <CircularProgress size='1rem' color='inherit' />}
	</Button>
);

export default function SignupForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [csrfToken, setCsrfTokenState] = useState("");

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
			email: formData.get("email") as string,
			password: formData.get("password") as string,
			confirmPassword: formData.get("confirmpassword") as string
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
			await create(formValues.name.trim(), formValues.email.toLowerCase().trim(), formValues.password, csrfToken);
			redirect("/account");
		} catch (error) {
			console.error("Signup error:", error);
			setErrorMessage("An error occurred during signup");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Wrapper variant='animated' sx={styles.wrapper}>
			<Box sx={styles.box} component='form' onSubmit={handleSubmit}>
				<Link href='/' passHref legacyBehavior>
					<IconButton
						href=''
						sx={{
							borderRadius: "0.5rem",
							border: "1px solid #ffffff20",
							minWidth: 0,
							width: "fit-content"
						}}
					>
						<Home />
					</IconButton>
				</Link>

				<Typography variant='h1' fontSize='3rem' py='2rem' width='100%' textAlign='center' sx={{ "& span": { fontWeight: 500, textWrap: "nowrap" } }}>
					Welcome to <span>Odin Pro</span>
				</Typography>

				<TextField
					placeholder='First Name'
					required
					slotProps={{
						input: { sx: { borderRadius: "1rem" }, name: "name" }
					}}
					fullWidth
				/>

				<TextField
					placeholder='E-mail'
					required
					slotProps={{
						input: { sx: { borderRadius: "1rem" }, name: "email" }
					}}
					fullWidth
				/>

				<PasswordField show={showPassword} onToggleVisibility={() => setShowPassword(!showPassword)} name='password' placeholder='Password' />

				<PasswordField
					show={showPassword}
					onToggleVisibility={() => setShowPassword(!showPassword)}
					name='confirmpassword'
					placeholder='Confirm Password'
				/>

				<ErrorAlert message={errorMessage} />
				<SubmitButton isLoading={isLoading} />

				<Typography mt='1rem' textAlign='center' width='100%'>
					Already have an account? <StyledLink href='/login'>Log In</StyledLink>
				</Typography>
			</Box>
		</Wrapper>
	);
}
