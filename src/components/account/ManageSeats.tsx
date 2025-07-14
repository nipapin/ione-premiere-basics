import { Product } from "@/types/interfaces";
import { Add, CheckCircle, Close, Error, Remove } from "@mui/icons-material";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Chip,
	CircularProgress,
	Collapse,
	Dialog,
	IconButton,
	Paper,
	Skeleton,
	Stack,
	styled,
	TextField,
	Typography
} from "@mui/material";
import { useEffect, useState } from "react";

const formatPrice = (price: number) => {
	return Math.max(0, price).toLocaleString("en-US", { style: "currency", currency: "USD" }) + " per seat";
};

const getDiscount = (quantity: number) => {
	if (quantity >= 5 && quantity <= 10) {
		return 0.9;
	} else if (quantity > 10 && quantity <= 20) {
		return 0.8;
	} else if (quantity > 20) {
		return 0.7;
	}
	return 1;
};

const applyDiscount = (price: number, quantity: number) => {
	return price * getDiscount(quantity);
};

const PaperCard = styled(Paper)(({ theme }) => ({
	padding: "1rem",
	display: "flex",
	gap: "1rem",
	alignItems: "flex-start",
	borderRadius: "1rem"
}));

export default function ManageSeats() {
	const [open, setOpen] = useState(false);
	const [product, setProduct] = useState<Product>();
	const [quantity, setQuantity] = useState<number>(product?.quantity || 1);
	const [nextQuantity, setNextQuantity] = useState<number>(product?.next_quantity || 1);
	const [pending, setPending] = useState(true);
	const [show, setShow] = useState(false);
	const [error, setError] = useState<string>("");
	const [discount, setDiscount] = useState<number>(1);
	const [chargeDiscount, setChargeDiscount] = useState<number>(1);

	console.log(product);

	const manageSeats = () => {
		setOpen(true);
	};

	const changeQuantity = (value: number) => () => {
		setNextQuantity((prev) => {
			const newQuantity = Math.max(1, prev + value);
			if (product) {
				setDiscount(getDiscount(newQuantity));
				setChargeDiscount(getDiscount(newQuantity - product.next_quantity));
			}
			return newQuantity;
		});
	};

	const handleChangeSeats = () => {
		if (!product) return;
		setPending(true);
		fetch(`/api/subscription/product`, {
			method: "POST",
			body: JSON.stringify({
				quantity: nextQuantity,
				charge:
					(applyDiscount(product.displayPrice, nextQuantity - product.quantity) *
						(nextQuantity - product.quantity) *
						product.daysBeforeCharge) /
					30
			})
		})
			.then((res) => res.json())
			.then((data) => {
				setShow(true);
				if (data.success) {
					setProduct(data.product);
					setQuantity(data.product.quantity);
					setNextQuantity(data.product.next_quantity);
					setDiscount(getDiscount(data.product.next_quantity));
					setChargeDiscount(getDiscount(data.product.next_quantity - data.product.quantity));
				} else {
					setError(data.error);
				}
			})
			.finally(() => setPending(false));
	};

	const handleClose = () => {
		setOpen(false);
		setShow(false);
		window.location.reload();
	};

	useEffect(() => {
		if (!open) return;
		const fetchProduct = async () => {
			const response = await fetch(`/api/subscription/product`);
			const data = await response.json();
			setProduct(data);
			setQuantity(data.quantity);
			setNextQuantity(data.next_quantity);
			setDiscount(getDiscount(data.next_quantity));
			setChargeDiscount(getDiscount(data.next_quantity - data.quantity));
		};
		fetchProduct().finally(() => setPending(false));
	}, [open]);

	return (
		<>
			<Button variant='contained' sx={{ borderRadius: "0.5rem" }} onClick={manageSeats}>
				Add / Remove
			</Button>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				fullWidth
				slotProps={{ paper: { sx: { borderRadius: "1rem" } } }}
			>
				<Card sx={{ p: "1rem 0.5rem" }}>
					<CardHeader
						title='Change Order Seats'
						subheader={`${
							product?.name !== "Odin Pro Lifetime" ? "Changes will take effect on your next billing cycle.\n" : ""
						}Payment will be charged immediately from your current balance.`}
						action={
							<IconButton onClick={handleClose}>
								<Close />
							</IconButton>
						}
						slotProps={{
							title: { fontWeight: "bold", mb: "0.5rem" },
							subheader: { fontSize: "0.875rem", whiteSpace: "pre-line" }
						}}
					/>
					<CardContent>
						<PaperCard variant='outlined'>
							{product ? (
								<>
									<Avatar src={product?.logoUrl} variant='rounded' sx={{ width: "4rem", height: "4rem" }} />
									<Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
										<Typography fontSize={"1rem"} fontWeight={"bold"}>
											{product.name}
										</Typography>
										<Typography variant='body1'>{formatPrice(product.displayPrice)}</Typography>
										<Typography variant='body1' fontSize={"0.875rem"} sx={{ opacity: 0.75 }}>
											Current:{" "}
											<Typography component='span' fontWeight={"bold"}>
												{quantity} seat{quantity > 1 ? "s" : ""}
											</Typography>
										</Typography>
									</Box>
								</>
							) : (
								<>
									<Skeleton variant='rounded' sx={{ width: "4rem", height: "4rem" }} />
									<Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
										<Skeleton variant='text' width={"10rem"} height={"1.5rem"} />
										<Skeleton variant='text' width={"8rem"} height={"1.5rem"} />
										<Skeleton variant='text' width={"12rem"} height={"1.5rem"} />
									</Box>
								</>
							)}
						</PaperCard>
						<Typography variant='body1' sx={{ my: "1rem" }}>
							Total Seats:
						</Typography>
						{product ? (
							<Stack direction='row' alignItems='center' gap='0.5rem'>
								<IconButton onClick={changeQuantity(-1)}>
									<Remove />
								</IconButton>
								<TextField
									value={nextQuantity}
									onChange={(e) => {
										setNextQuantity((prev) => {
											const newQuantity = Math.max(1, Number(e.target.value));
											if (product) {
												setDiscount(getDiscount(newQuantity));
												setChargeDiscount(getDiscount(newQuantity - product.next_quantity));
											}
											return newQuantity;
										});
									}}
									size='small'
									slotProps={{ input: { sx: { textAlign: "center", width: "6rem" } } }}
								/>
								<IconButton onClick={changeQuantity(1)}>
									<Add />
								</IconButton>
							</Stack>
						) : (
							<Stack direction='row' alignItems='center' gap='0.5rem'>
								<Skeleton variant='circular' sx={{ width: "2rem", height: "2rem" }} />
								<Skeleton variant='text' sx={{ width: "6rem", height: "2rem" }} />
								<Skeleton variant='circular' sx={{ width: "2rem", height: "2rem" }} />
							</Stack>
						)}
						<PaperCard variant='outlined' sx={{ flexDirection: "column", mt: "1rem" }}>
							{product && product.name !== "Odin Pro Lifetime" && (
								<Stack direction='row' alignItems='center' gap='0.5rem' width={"100%"}>
									<Typography variant='body1'>Next billing charge:</Typography>
									<Typography variant='body1' ml={"auto"}>
										{discount < 1 ? (
											<Chip
												component='span'
												label={`${Math.round((1 - discount) * 100)}% off`}
												size='small'
												sx={{ mr: "0.5rem", fontWeight: "bold" }}
												color='primary'
											/>
										) : (
											<></>
										)}
										{formatPrice(applyDiscount(product.displayPrice, nextQuantity) * nextQuantity)}
									</Typography>
								</Stack>
							)}

							<Stack direction='row' alignItems='center' gap='0.5rem' width={"100%"}>
								<Typography variant='body1' fontWeight={"bold"}>
									You will be charged now for:
								</Typography>
								{product ? (
									<Typography variant='body1' ml={"auto"} fontWeight={"bold"}>
										{chargeDiscount < 1 ? (
											<Chip
												component='span'
												label={`${Math.round((1 - chargeDiscount) * 100)}% off`}
												size='small'
												sx={{ mr: "0.5rem", fontWeight: "bold" }}
												color='primary'
											/>
										) : (
											<></>
										)}
										{product.name === "Odin Pro Lifetime"
											? formatPrice(
													applyDiscount(product.displayPrice, nextQuantity) * (nextQuantity - product.next_quantity)
											  )
											: formatPrice(
													(applyDiscount(product.displayPrice, nextQuantity - product.next_quantity) *
														(nextQuantity - product.next_quantity) *
														product.daysBeforeCharge) /
														30
											  )}
									</Typography>
								) : (
									<Skeleton variant='text' width={"8rem"} height={"1.5rem"} />
								)}
							</Stack>
						</PaperCard>

						<Collapse in={show} unmountOnExit>
							<Alert
								severity={error ? "error" : "success"}
								variant='outlined'
								sx={{
									mt: "1rem",
									borderRadius: "0.5rem",
									alignItems: "center",
									padding: "1rem",
									color: error ? "error" : "var(--primary)",
									borderColor: error ? "error" : "var(--primary)",
									"& .MuiAlert-action": {
										paddingTop: 0
									}
								}}
								icon={error ? <Error /> : <CheckCircle sx={{ color: "var(--primary)" }} />}
								onClose={() => setShow(false)}
							>
								{error || "Seats changed successfully"}
							</Alert>
						</Collapse>
					</CardContent>
					<CardActions sx={{ justifyContent: "flex-end", padding: "1rem" }}>
						<Button variant='text' sx={{ borderRadius: "0.5rem" }} disabled={pending} onClick={handleClose}>
							Close
						</Button>
						<Button
							variant='contained'
							sx={{ borderRadius: "0.5rem" }}
							disabled={!product || nextQuantity === product.quantity || pending}
							onClick={handleChangeSeats}
							endIcon={pending ? <CircularProgress size={"1rem"} /> : undefined}
						>
							Change Seats
						</Button>
					</CardActions>
				</Card>
			</Dialog>
		</>
	);
}
