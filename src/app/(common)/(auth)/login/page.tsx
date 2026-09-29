import LoginForm from "@/components/forms/LoginForm";
import { Box } from "@mui/material";

interface LoginPageProps {
	searchParams: Promise<{ next?: string; after: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { next, after } = await searchParams;
	return (
		<Box display={"flex"} justifyContent={"center"} position={"relative"} py='5rem' height={"100vh"}>
			<LoginForm next={next} after={after} />
		</Box>
	);
}
