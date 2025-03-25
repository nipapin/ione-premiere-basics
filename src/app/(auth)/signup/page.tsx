import StyledLink from "@/components/StyledLink";
import { Box, Typography } from "@mui/material";

export default function SignupPage() {
	return (
		<Box minHeight={"100vh"}>
			<Typography>Signup page</Typography>
			<StyledLink href={"/login"}>Login</StyledLink>
		</Box>
	);
}
