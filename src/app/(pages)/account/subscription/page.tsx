import { Box, Button, Divider, Link, TextField, Typography } from "@mui/material";

export default function SubscriptionPage() {
	return (
		<Box
			sx={{
				"& p, a": { fontWeight: "200" },
				"& h1, h2": { fontWeight: "400" }
			}}
		>
			<Typography variant='h1' sx={{ fontSize: "1.2rem" }}>
				Subscription details
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Box
				sx={{
					display: "flex",
					flexDirection: { md: "row", xs: "column" },
					justifyContent: "space-between",
					alignItems: { md: "center", xs: "stretch" }
				}}
			>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "auto 1fr",
						gap: "1rem",
						my: "1rem",
						alignItems: "center"
					}}
				>
					<Typography sx={{ textAlign: "end" }}>Status:</Typography>
					<Link href='#' sx={{ color: "var(--primary)" }}>
						Active
					</Link>
					<Typography sx={{ textAlign: "end" }}>Type:</Typography>
					<Link href='#' sx={{ color: "var(--primary)" }}>
						Personal (monthly plan)
					</Link>
					<Typography sx={{ textAlign: "end" }}>Period:</Typography>
					<Link href='#' sx={{ color: "var(--primary)" }}>
						until 15 Mar 2025
					</Link>
				</Box>
				<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
					Change Plan
				</Button>
			</Box>
			<Typography variant='h2' sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}>
				Seats settings
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Box
				sx={{
					display: "flex",
					flexDirection: { md: "row", xs: "column" },
					justifyContent: "space-between",
					alignItems: { md: "center", xs: "stretch" },
					gap: "1rem"
				}}
			>
				<Box sx={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
					<Typography>Number of seats:</Typography>
					<Link href='#' sx={{ color: "var(--primary)" }}>
						1 seat
					</Link>
				</Box>
				<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
					Add / Remove
				</Button>
			</Box>
			<Typography sx={{ my: "1rem" }}>Active seats:</Typography>
			<TextField
				variant='outlined'
				defaultValue={"nickname@website.com"}
				fullWidth
				slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
			/>

			<Typography variant='h2' sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}>
				Payment Method
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
				Change Payment Method
			</Button>
			<Typography variant='h2' sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}>
				Billing Address
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
				Change billing Address
			</Button>
			<Typography variant='h2' sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}>
				Invoices
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
				View invoices
			</Button>
			<Typography variant='h2' sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}>
				Cancel
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
				Cancel my plan
			</Button>
		</Box>
	);
}
