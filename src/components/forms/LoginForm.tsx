"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { FormEvent, useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import StyledLink from "../ui/StyledLink";

export const styles = {
	wrapper: {
		width: "100%",
		maxWidth: { xl: "600px", lg: "600px", md: "600px" },
		px: { md: 0, xs: "1rem" }
	},
	box: {
		padding: { md: "2rem", xs: "1rem" },
		display: "flex",
		flexDirection: "column",
		gap: "1rem",
		width: "100%",
		background: "var(--background-gradient)",
		height: "fit-content"
	}
};

export default function LoginForm() {
	const [show, setShow] = useState<boolean>(false);
	const toggleVisibility = () => setShow(!show);
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const email = data.get("email");
		const password = data.get("password");
		localStorage.setItem("user", JSON.stringify({ email, password }));
		redirect("/");
	};

	return (
		<Wrapper variant='animated' sx={styles.wrapper}>
			<Box sx={styles.box} component={"form"} onSubmit={handleSubmit}>
				<Typography
					variant='h1'
					fontSize={{ md: "3rem", xs: "2rem" }}
					py={"5rem"}
					width={"100%"}
					textAlign={"center"}
				>
					Welcome Back!
				</Typography>
				<TextField
					placeholder='E-mail'
					slotProps={{
						input: { sx: { borderRadius: "1rem" }, name: "email" }
					}}
					fullWidth
				/>
				<TextField
					placeholder='Password'
					type={show ? "text" : "password"}
					slotProps={{
						input: {
							sx: { borderRadius: "1rem" },
							endAdornment: (
								<IconButton onClick={toggleVisibility}>
									{show ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							),
							name: "password"
						}
					}}
					fullWidth
				/>
				<Button variant='contained' sx={{ my: "2rem" }} type='submit'>
					Sign In
				</Button>
				<Typography mt={"2rem"} textAlign={"center"} width={"100%"}>
					Have no account yet? <StyledLink href={"/signup"}>Sign Up</StyledLink>
				</Typography>
			</Box>
		</Wrapper>
	);
}
