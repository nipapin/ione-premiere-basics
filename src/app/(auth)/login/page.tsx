import LoginForm from "@/components/forms/LoginForm";
import { Box } from "@mui/material";

export default function LoginPage() {
	return (
		<Box
			display={"flex"}
			justifyContent={"center"}
			position={"relative"}
			py={{ md: "10rem", xs: "5rem" }}
		>
			<LoginForm />
		</Box>
	);
}
