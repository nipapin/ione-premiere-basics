"use client";

import { isExist, login } from "@/actions/user";
import { setCsrfToken } from "@/lib/csrf";
import { Home, Visibility, VisibilityOff } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, IconButton, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import StyledLink from "../ui/StyledLink";

interface LoginFormData {
	email: string;
	password: string;
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
		<Typography>Sign In</Typography>
		{isLoading && <CircularProgress size='1rem' color='inherit' />}
	</Button>
);

export const styles = {
	wrapper: {
		width: "100%",
		height: "100%",
		maxWidth: { xl: "600px", lg: "600px", md: "600px" },
		px: { md: 0, xs: "1rem" }
	},
	box: {
		padding: { md: "2rem", xs: "1rem" },
		display: "flex",
		flexDirection: "column",
		gap: "1rem",
		width: "100%",
		height: "100%",
		background: "var(--background-gradient)"
	}
};

export default function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [csrfToken, setCsrfTokenState] = useState("");
	const [emailError, setEmailError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const { push } = useRouter();

	useEffect(() => {
		// Generate a random token for CSRF protection
		const token = Math.random().toString(36).substring(2);
		setCsrfTokenState(token);
		setCsrfToken(token);
	}, []);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setEmailError(false);
		setPasswordError(false);
		const formData = new FormData(event.currentTarget);
		const formValues: LoginFormData = {
			email: formData.get("email") as string,
			password: formData.get("password") as string
		};

		try {
			const isValid = await isExist(formValues.email);
			if (!isValid) {
				setEmailError(true);
				setIsLoading(false);
				return;
			}

			const user = await login(formValues.email, formValues.password, csrfToken);

			if (user) {
				push("/account");
			} else {
				setPasswordError(true);
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Login error:", error);
		}
	};

	return (
		<Wrapper variant='animated' sx={styles.wrapper}>
			<Box sx={styles.box} component={"form"} onSubmit={handleSubmit}>
				<Link href='/' passHref legacyBehavior>
					<IconButton href='' sx={{ borderRadius: "0.5rem", border: "1px solid #ffffff20", minWidth: 0, width: "fit-content" }}>
						<Home />
					</IconButton>
				</Link>
				<Typography variant='h1' fontSize={{ md: "3rem", xs: "2rem" }} py={"5rem"} width={"100%"} textAlign={"center"}>
					Welcome Back!
				</Typography>
				<TextField
					placeholder='E-mail'
					required
					slotProps={{
						input: { sx: { borderRadius: "1rem" }, name: "email" }
					}}
					fullWidth
				/>
				<PasswordField show={showPassword} onToggleVisibility={() => setShowPassword(!showPassword)} name='password' placeholder='Password' />
				{emailError && (
					<Alert severity='error' sx={{ alignItems: "center" }}>
						<Typography>This email is not registered</Typography>
					</Alert>
				)}
				{passwordError && (
					<Alert severity='error' sx={{ alignItems: "center" }}>
						<Typography>Invalid password</Typography>
					</Alert>
				)}
				<SubmitButton isLoading={isLoading} />
				<Typography mt={"1rem"} textAlign={"center"} width={"100%"}>
					Have no account yet? <StyledLink href={"/signup"}>Sign Up</StyledLink>
				</Typography>
			</Box>
		</Wrapper>
	);
}
