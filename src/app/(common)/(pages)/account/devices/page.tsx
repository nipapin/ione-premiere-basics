import { Circle, Delete } from "@mui/icons-material";
import { Box, Divider, IconButton, List, Paper, Typography } from "@mui/material";
import { redirect } from "next/navigation";

export default function AccountDevices() {
	return redirect("/account");
	return (
		<Box
			sx={{
				"& p, a": { fontWeight: "400" },
				"& h1, h2": { fontWeight: "500" }
			}}
		>
			<Typography variant='h1' sx={{ fontSize: "1.2rem" }}>
				My Devices
			</Typography>
			<Divider sx={{ my: "1rem" }} />

			<Typography>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
				magna aliqua. Ut enim ad minim veniam, quis.
			</Typography>

			<List disablePadding sx={{ py: "1rem" }}>
				{[1].map((device) => {
					return (
						<Paper
							key={device}
							variant='outlined'
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
								p: "0.5rem 1rem"
							}}
						>
							<Typography>Ione PC</Typography>
							<Circle sx={{ fontSize: "10px" }} />
							<Typography>Personal</Typography>
							<IconButton sx={{ ml: "auto" }}>
								<Delete />
							</IconButton>
						</Paper>
					);
				})}
			</List>
		</Box>
	);
}
