import SignupForm from "@/components/forms/SignupForm";
import { Box } from "@mui/material";

interface SignupPageProps {
	searchParams: Promise<{ after: string; referal_code: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
	const { after, referal_code } = await searchParams;
	return (
		<Box display={"flex"} justifyContent={"center"} position={"relative"} py='5rem' height={"100vh"}>
			<SignupForm after={after} referal_code={referal_code} />
		</Box>
	);
}
