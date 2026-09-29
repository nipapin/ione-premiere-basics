import SignupForm from "@/components/forms/SignupForm";
import { Box } from "@mui/material";

interface SignupPageProps {
	searchParams: Promise<{ next?: string; after: string; referal_code: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
	const { next, after, referal_code } = await searchParams;
	return (
		<Box display={"flex"} justifyContent={"center"} position={"relative"} py='5rem' height={"100vh"}>
			<SignupForm next={next} after={after} referal_code={referal_code} />
		</Box>
	);
}
