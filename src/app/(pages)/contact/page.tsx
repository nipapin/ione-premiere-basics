"use client";

import PageContainer from "@/components/layout/PageContainer";
import Title from "@/components/ui/Title";
import { sendEmailFromContact } from "@/lib/email";
import { Alert, Box, Button, CircularProgress, Link as MuiLink, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});

	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState<boolean>();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);
		const result = await sendEmailFromContact(formData.email, formData.subject, formData.message);
		setIsLoading(false);

		setIsSuccess(result);
	};

	return (
		<PageContainer sx={{ maxWidth: "1280px", gap: "1rem" }}>
			<Title sx={{ textAlign: "start", width: "100%", fontWeight: 400 }}>Contact Us</Title>
			<Box width={"100%"} sx={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
				<Typography variant="h5">Get in Touch</Typography>
				<Typography variant="body1">
					{`Have questions or feedback? We'd love to hear from you. Fill out the form and we'll get back to you as soon as
					possible.`}
				</Typography>
				<Box
					component="form"
					onSubmit={handleSubmit}
					noValidate
					sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
				>
					<TextField
						required
						fullWidth
						label="Name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						variant="outlined"
					/>
					<TextField
						required
						fullWidth
						label="Email"
						name="email"
						type="email"
						value={formData.email}
						onChange={handleChange}
						variant="outlined"
					/>

					<TextField
						required
						fullWidth
						label="Subject"
						name="subject"
						value={formData.subject}
						onChange={handleChange}
						variant="outlined"
					/>

					<TextField
						required
						fullWidth
						label="Message"
						name="message"
						multiline
						rows={4}
						value={formData.message}
						onChange={handleChange}
						variant="outlined"
					/>
					{isSuccess !== undefined && (
						<Alert
							severity={isSuccess ? "success" : "error"}
							sx={{ display: "flex", alignItems: "center", gap: "1rem" }}
						>
							<Typography variant="body1" whiteSpace={"pre"}>
								{isSuccess ? (
									`Your message has been sent successfully. We will get back to you as soon as possible.`
								) : (
									<>
										There was an error sending your message. Please try again. If the problem persists, please contact
										us directly at{" "}
										<Link href="mailto:help@odin-pro.com" passHref>
											<MuiLink component="span">help@odin-pro.com</MuiLink>
										</Link>
									</>
								)}
							</Typography>
						</Alert>
					)}
					<Button
						type="submit"
						variant="contained"
						size="large"
						sx={{
							py: 1.5,
							px: 4,
						}}
					>
						{isLoading ? <CircularProgress size={20} color="inherit" /> : "Send Message"}
					</Button>
				</Box>
			</Box>
		</PageContainer>
	);
}
