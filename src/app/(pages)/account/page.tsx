import { Box, Button, Divider, TextField, Typography } from "@mui/material";

export default function AccountPage() {
	return (
		<Box
			sx={{
				"& p, a": { fontWeight: "400" },
				"& h1, h2": { fontWeight: "500" }
			}}
		>
			<Typography variant='h1' sx={{ fontSize: "1.2rem" }}>
				Account Details
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Typography sx={{ my: "1rem" }}>Email</Typography>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "3fr 1fr",
					gap: "1rem",
					width: "100%",
					my: "1rem",
					alignItems: "center"
				}}
			>
				<TextField
					variant='outlined'
					fullWidth
					slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
				/>
				<Button
					variant='contained'
					sx={{
						borderRadius: "0.5rem",
						height: "fit-content"
					}}
				>
					Change Email
				</Button>
			</Box>
			<Box>
				<Box
					sx={{
						display: "grid",
						gap: "1rem",
						gridTemplateColumns: "3fr 3fr 1fr",
						mb: "1rem",
						mt: "2rem"
					}}
				>
					<Typography>First Name</Typography>
					<Typography>Last Name</Typography>
				</Box>
				<Box
					sx={{
						display: "grid",
						gap: "1rem",
						gridTemplateColumns: "3fr 3fr 1fr",
						my: "1rem",
						alignItems: "center"
					}}
				>
					<TextField
						variant='outlined'
						fullWidth
						slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
					/>
					<TextField
						variant='outlined'
						fullWidth
						slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
					/>
					<Button
						variant='contained'
						sx={{ borderRadius: "0.5rem", height: "fit-content" }}
					>
						Apply
					</Button>
				</Box>
			</Box>
			<Typography variant='h2' sx={{ fontSize: "1.2rem", pt: "1rem" }}>
				Change Password
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Typography sx={{ my: "1rem" }}>Current password</Typography>
			<Box
				sx={{
					display: "grid",
					gap: "1rem",
					gridTemplateColumns: "3fr 3fr 1fr",
					mb: "1rem",
					mt: "2rem"
				}}
			>
				<TextField
					variant='outlined'
					fullWidth
					slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
				/>
			</Box>
			<Box>
				<Box
					sx={{
						display: "grid",
						gap: "1rem",
						gridTemplateColumns: "3fr 3fr 1fr",
						mb: "1rem",
						mt: "2rem"
					}}
				>
					<Typography>New Password</Typography>
					<Typography>Confirm new password</Typography>
				</Box>
				<Box
					sx={{
						display: "grid",
						gap: "1rem",
						gridTemplateColumns: "3fr 3fr 1fr",
						my: "1rem"
					}}
				>
					<TextField
						variant='outlined'
						fullWidth
						slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
					/>
					<TextField
						variant='outlined'
						fullWidth
						slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
					/>
				</Box>
			</Box>
			<Button variant='contained' sx={{ borderRadius: "0.5rem", mt: "1rem" }}>
				Change password
			</Button>
		</Box>
	);
}
