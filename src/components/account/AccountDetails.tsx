import { Box, Divider, Typography } from "@mui/material";
import ChangeEmailForm from "./forms/ChangeEmailForm";
import ChangeNameForm from "./forms/ChangeNameForm";
import ChangePasswordForm from "./forms/ChangePasswordForm";

export default function AccountDetails() {
	return (
		<Box sx={{ "& h1, h2": { fontWeight: 400 } }}>
			<Typography variant="h1" sx={{ fontSize: "1.2rem" }}>
				Account Details
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<ChangeEmailForm />
			<Divider sx={{ my: "1rem" }} />
			<ChangeNameForm />
			<Divider sx={{ my: "1rem" }} />
			<ChangePasswordForm />
		</Box>
	);
}
