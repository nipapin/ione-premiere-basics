import { query } from "@/app/database/postgre";
import { Box, Button, Typography } from "@mui/material";
import { redirect } from "next/navigation";

export default async function page({ searchParams }: { searchParams: Promise<{ token: string; email: string }> }) {
	const { token, email } = await searchParams;
	const decodedEmail = Buffer.from(email, "base64").toString("utf-8");
	const user = await query(`UPDATE users SET email = $1, confirmtoken = null WHERE confirmtoken = $2 RETURNING *`, [decodedEmail, token], { single: true });

	if (!user) {
		return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: 2, }}>
			<Typography variant="h6">Error</Typography>
			<Typography variant="body1">Invalid token</Typography>
			<Typography>Cant find user with this token</Typography>
			<Button variant="contained" color="primary" href="/contact">Contact us</Button>
		</Box>
	}

	redirect("/login");
}
