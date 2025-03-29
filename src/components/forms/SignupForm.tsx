"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { FormEvent, useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import StyledLink from "../ui/StyledLink";
import { styles } from "./LoginForm";

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
					fontSize={"3rem"}
					py={"2rem"}
					width={"100%"}
					textAlign={"center"}
					sx={{ "& span": { fontWeight: 500, textWrap: "nowrap" } }}
				>
					Welcome to <span>Odin Pro</span>
				</Typography>
				<TextField
					placeholder='First Name'
					slotProps={{
						input: { sx: { borderRadius: "1rem" }, name: "firstname" }
					}}
					fullWidth
				/>
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
				<TextField
					placeholder='Confirm Password'
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
					Sign Up
				</Button>
				<Typography mt={"1rem"} textAlign={"center"} width={"100%"}>
					Already have an account?{" "}
					<StyledLink href={"/login"}>Log In</StyledLink>
				</Typography>
			</Box>
		</Wrapper>
	);
}
