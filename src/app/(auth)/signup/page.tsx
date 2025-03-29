import SignupForm from "@/components/forms/SignupForm";
import { Box } from "@mui/material";

export default function SignupPage() {
	return (
		<Box
			display={"flex"}
			justifyContent={"center"}
			position={"relative"}
			py={{ md: "10rem", xs: "5rem" }}
		>
			<SignupForm />
		</Box>
	);
}
