"use client";

import { InfoOutlined, OpenInNew } from "@mui/icons-material";
import { Button, Tooltip, Typography } from "@mui/material";
import NextLink from "next/link";

export const PaymentDetails = () => {
	return (
		<>
			<Typography
				variant="h2"
				fontWeight={"bold"}
				fontSize={"1.2rem"}
				sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
			>
				Payment details
				<Tooltip
					title={`If you want to log in for the first time, you should use your email address to reset your password.\n\nAfterwards, you can use this password and email address to log into your account.`}
					slotProps={{
						tooltip: {
							sx: {
								fontSize: "1rem",
								backgroundColor: "background.paper",
								p: "1rem",
								borderRadius: "0.5rem",
								border: "1px solid var(--primary)",
								whiteSpace: "pre-line",
							},
						},
					}}
				>
					<InfoOutlined sx={{ cursor: "pointer" }} />
				</Tooltip>
			</Typography>
			<NextLink href={"https://cc.payproglobal.com/Customer/Account/Login"} passHref target="_blank">
				<Button
					component="span"
					variant="contained"
					sx={{ borderRadius: "0.5rem", mt: "1rem" }}
					endIcon={<OpenInNew />}
				>
					View payment details
				</Button>
			</NextLink>
			{/* <Dialog
				open={open}
				onClose={toggleDialog(false)}
				fullWidth
				maxWidth="sm"
				slotProps={{ paper: { sx: { borderRadius: "1rem" }, elevation: 1 } }}
			>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", p: "1rem" }}>
					<Typography fontWeight="bold" fontSize="1.2rem">
						Cancel my plan
					</Typography>
					<IconButton onClick={toggleDialog(false)}>
						<Close />
					</IconButton>
				</Box>
				<Divider />
				<DialogContent sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
					<Typography>Why do you want to cancel your plan?</Typography>
					<Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
						{variants.map((variant, index) => {
							return (
								<FormControlLabel
									control={<Checkbox onChange={toggleVariant(index)} />}
									label={variant.label}
									key={variant.label}
								/>
							);
						})}
					</Box>
					<Collapse in={selectedVariants.includes(5)}>
						<TextField
							label="Reason"
							fullWidth
							multiline
							rows={4}
							placeholder="Reason for cancellation"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</Collapse>
					<Divider />
				</DialogContent>
				<Box sx={{ padding: "1rem 24px", pt: 0 }}>
					<Button variant="contained" onClick={finishSubscription} disabled={selectedVariants.length === 0}>
						Confirm
					</Button>
				</Box>
			</Dialog> */}
		</>
	);
};
