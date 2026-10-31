import SignupForm from "@/components/forms/SignupForm";
import { Box } from "@mui/material";

interface SignupPageProps {
	searchParams: Promise<{ next?: string; after?: string; referal_code?: string; auth_error?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
	const { next, after, referal_code, auth_error } = await searchParams;
	return (
		<Box display={"flex"} justifyContent={"center"} position={"relative"} py='5rem' minHeight={"100vh"}>
			<SignupForm next={next} after={after} referal_code={referal_code} authError={auth_error} />
		</Box>
	);
}
