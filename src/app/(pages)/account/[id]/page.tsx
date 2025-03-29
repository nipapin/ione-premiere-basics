import { JSX } from "react";
import {
	Box,
	Button,
	Divider,
	IconButton,
	Link,
	List,
	Paper,
	TextField,
	Typography
} from "@mui/material";
import { Circle, Delete } from "@mui/icons-material";
import { notFound } from "next/navigation";

interface RouteProps {
	params: Promise<{ id: string }>;
}

const accountRoutes: Record<string, () => JSX.Element> = {
	subscription: () => {
		return (
			<Box
				sx={{
					"& p, a": { fontWeight: "400" },
					"& h1, h2": { fontWeight: "500" }
				}}
			>
				<Typography variant='h1' sx={{ fontSize: "1.2rem" }}>
					Subscription details
				</Typography>
				<Divider sx={{ my: "1rem" }} />
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "auto 1fr auto",
						gap: "1rem",
						my: "1rem",
						alignItems: "center"
					}}
				>
					<Typography sx={{ textAlign: "end" }}>Status:</Typography>
					<Link href='#' sx={{ color: "var(--primary)" }}>
						Active
					</Link>
					<br />
					<Typography sx={{ textAlign: "end" }}>Type:</Typography>
					<Link href='#' sx={{ color: "var(--primary)" }}>
						Personal (monthly plan)
					</Link>
					<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
						Change Plan
					</Button>
					<Typography sx={{ textAlign: "end" }}>Period:</Typography>
					<Link href='#' sx={{ color: "var(--primary)" }}>
						until 15 Mar 2025
					</Link>
					<br />
				</Box>

				<Typography
					variant='h2'
					sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}
				>
					Seats settings
				</Typography>
				<Divider sx={{ my: "1rem" }} />

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "auto 1fr auto",
						gap: "1rem",
						my: "1rem",
						fontWeight: "400",
						alignItems: "center"
					}}
				>
					<Typography>Number of seats:</Typography>
					<Link href='#' sx={{ color: "var(--primary)" }}>
						1 seat
					</Link>
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

				<Typography
					variant='h2'
					sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}
				>
					Payment Method
				</Typography>
				<Divider sx={{ my: "1rem" }} />
				<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
					Change Payment Method
				</Button>
				<Typography
					variant='h2'
					sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}
				>
					Billing Address
				</Typography>
				<Divider sx={{ my: "1rem" }} />
				<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
					Change billing Address
				</Button>
				<Typography
					variant='h2'
					sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}
				>
					Invoices
				</Typography>
				<Divider sx={{ my: "1rem" }} />
				<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
					View invoices
				</Button>
				<Typography
					variant='h2'
					sx={{ fontSize: "1.2rem", fontWeight: "400", mt: "2rem" }}
				>
					Cancel
				</Typography>
				<Divider sx={{ my: "1rem" }} />
				<Button variant='contained' sx={{ borderRadius: "0.5rem" }}>
					Cancel my plan
				</Button>
			</Box>
		);
	},
	devices: () => {
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
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
					eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
					minim veniam, quis.
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
	},
	extension: () => {
		return (
			<Box
				sx={{
					"& p, a": { fontWeight: "400" },
					"& h1, h2": { fontWeight: "500" }
				}}
			>
				<Typography variant='h1' sx={{ fontSize: "1.2rem" }}>
					Extension
				</Typography>
				<Divider sx={{ my: "1rem" }} />

				<Typography>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
					eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
					minim veniam, quis.
				</Typography>

				<List disablePadding sx={{ py: "1rem" }}>
					{[1].map((extension) => {
						return (
							<Box
								key={extension}
								sx={{
									display: "flex",
									alignItems: "center",
									gap: "1rem",
									p: "0.5rem 0"
								}}
							>
								<Typography>Odin Pro</Typography>
								<Typography>—</Typography>
								<Link href='#' sx={{ color: "var(--primary)" }}>
									version 1.0.3
								</Link>
								<Button
									variant='contained'
									sx={{ ml: "auto", borderRadius: "0.5rem" }}
								>
									Download
								</Button>
							</Box>
						);
					})}
				</List>
			</Box>
		);
	}
};

export default async function Route({ params }: RouteProps) {
	const { id } = await params;
	if (accountRoutes[id]) {
		return accountRoutes[id]();
	}
	notFound();
}
