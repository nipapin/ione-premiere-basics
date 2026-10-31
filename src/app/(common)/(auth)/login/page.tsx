import LoginForm from "@/components/forms/LoginForm";
import { Box } from "@mui/material";

interface LoginPageProps {
	searchParams: Promise<{ next?: string; after?: string; auth_error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { next, after, auth_error } = await searchParams;
	return (
		<Box display={"flex"} justifyContent={"center"} position={"relative"} py='5rem' minHeight={"100vh"}>
			<LoginForm next={next} after={after} authError={auth_error} />
		</Box>
	);
}
