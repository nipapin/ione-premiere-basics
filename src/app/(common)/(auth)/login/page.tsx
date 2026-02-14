import LoginForm from "@/components/forms/LoginForm";
import { Box } from "@mui/material";

interface LoginPageProps {
	searchParams: Promise<{ after: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { after } = await searchParams;
	return (
		<Box display={"flex"} justifyContent={"center"} position={"relative"} py='5rem' height={"100vh"}>
			<LoginForm after={after} />
		</Box>
	);
}
