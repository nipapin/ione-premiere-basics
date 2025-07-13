"use client";

import { useUser } from "@/contexts/UserWrapper";
import { Close, Info, InfoOutlined, OpenInNew } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Checkbox,
	Collapse,
	Dialog,
	DialogContent,
	Divider,
	FormControlLabel,
	IconButton,
	TextField,
	Tooltip,
	Typography
} from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";

const variants = [
	{ label: "Too expensive / Not worth the price" },
	{ label: "I didn’t find the templates/elements I needed" },
	{ label: "I experienced technical issues or bugs" },
	{ label: "I’m switching to another tool or platform" },
	{ label: "I’m not using it as much as I thought" },
	{ label: "Other (please specify)" }
];

export const PaymentDetails = () => {
	const user = useUser();

	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState("");
	const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);

	const finishSubscription = () => {
		fetch("/api/subscription/finish", {
			method: "POST",
			body: JSON.stringify({
				user_id: user?.user_id,
				reason: [...selectedVariants.map((v) => variants[v].label), reason].join("\n")
			})
		})
			.then((res) => res.json())
			.then(() => setOpen(false));
	};

	const toggleVariant = (index: number) => () => {
		setSelectedVariants((prev) => {
			if (prev.includes(index)) {
				return prev.filter((i) => i !== index);
			}
			return [...prev, index];
		});
	};

	const toggleDialog = (state: boolean) => () => {
		setOpen(state);
		setSelectedVariants([]);
		setReason("");
	};

	const getPaymentDetails = () => {
		fetch("/api/subscription/payment-details")
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
			});
	};

	return (
		<>
			<Typography
				variant='h2'
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
								whiteSpace: "pre-line"
							}
						}
					}}
				>
					<InfoOutlined sx={{ cursor: "pointer" }} />
				</Tooltip>
			</Typography>
			<NextLink href={"https://cc.payproglobal.com/Customer/Account/Login"} passHref target='_blank'>
				<Button
					variant='contained'
					sx={{ borderRadius: "0.5rem", mt: "1rem" }}
					endIcon={<OpenInNew />}
					onClick={getPaymentDetails}
				>
					View payment details
				</Button>
			</NextLink>
			<Button
				variant='text'
				size='small'
				onClick={toggleDialog(true)}
				color='error'
				sx={{ display: "block", mt: "1rem", width: "fit-content" }}
			>
				Cancel my plan
			</Button>
			<Dialog
				open={open}
				onClose={toggleDialog(false)}
				fullWidth
				maxWidth='sm'
				slotProps={{ paper: { sx: { borderRadius: "1rem" }, elevation: 1 } }}
			>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", p: "1rem" }}>
					<Typography fontWeight='bold' fontSize='1.2rem'>
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
							label='Reason'
							fullWidth
							multiline
							rows={4}
							placeholder='Reason for cancellation'
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</Collapse>
					<Divider />
				</DialogContent>
				<Box sx={{ padding: "1rem 24px", pt: 0 }}>
					<Button variant='contained' onClick={finishSubscription} disabled={selectedVariants.length === 0}>
						Confirm
					</Button>
				</Box>
			</Dialog>
		</>
	);
};
