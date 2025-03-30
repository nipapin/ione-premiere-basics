import SignupForm from "@/components/forms/SignupForm";
import { Box } from "@mui/material";

export default function SignupPage() {
	return (
		<Box display={"flex"} justifyContent={"center"} position={"relative"} py='5rem' height={"100vh"}>
			<SignupForm />
		</Box>
	);
}
