import StyledLink from "@/components/StyledLink";
import { Box, Typography } from "@mui/material";

export default function LoginPage() {
	return (
		<Box minHeight={"100vh"}>
			<Typography>Login page</Typography>
			<StyledLink href={"/signup"}>Signup</StyledLink>
		</Box>
	);
}
