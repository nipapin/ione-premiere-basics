import { Box, Button, Divider, Link, List, Typography } from "@mui/material";

export default function AccountExtension() {
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
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
				magna aliqua. Ut enim ad minim veniam, quis.
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
							<Button variant='contained' sx={{ ml: "auto", borderRadius: "0.5rem" }}>
								Download
							</Button>
						</Box>
					);
				})}
			</List>
		</Box>
	);
}
