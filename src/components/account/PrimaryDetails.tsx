import { ISubscriptionDetails, PrimaryDetailsProps } from "@/types/interfaces";
import { InfoOutlined } from "@mui/icons-material";
import { Box, Divider, Skeleton, Tooltip, Typography } from "@mui/material";
import ManageSeats from "./ManageSeats";
import { PaymentDetails } from "./PaymentDetails";
import { Seat } from "./Seat";

const subscriptionDetails = [
	{ id: 1, label: "Status", key: "status" },
	{ id: 2, label: "Type", key: "order_item_name" },
	{ id: 3, label: "Period", key: "next_charge_date" }
];

const subscriptionStyle = (pending: boolean) => ({
	display: "flex",
	alignItems: "center",
	gap: "1rem",
	"& span": pending ? {} : { color: "var(--primary)", textDecoration: "underline" }
});

export default function PrimaryDetails({ subscription, user, pending }: PrimaryDetailsProps) {
	return (
		<Box>
			<Typography variant='h1' fontWeight='bold' fontSize={"1.2rem"}>
				Subscription details
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Box display={"flex"} flexDirection={"column"} gap={"1rem"} my={"1rem"}>
				{subscriptionDetails.map((detail) => (
					<Typography key={detail.id} sx={subscriptionStyle(pending)}>
						{detail.label}:{" "}
						{pending ? (
							<Skeleton variant='text' width={100} height={24} />
						) : (
							<Typography component='span'>{subscription?.[detail.key as keyof ISubscriptionDetails]}</Typography>
						)}
					</Typography>
				))}
			</Box>
			<Box display={"flex"} alignItems={"center"} gap={"0.5rem"} mt={"2rem"}>
				<Typography variant='h2' fontWeight='bold' fontSize={"1.2rem"}>
					Seats settings
				</Typography>
				<Tooltip
					title={`You can purchase additional seats and assign them to others by simply entering their email address in your account dashboard.`}
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
			</Box>
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
				<Box display={"grid"} gridTemplateColumns={"auto 1fr"} gap={"1rem"} my={"1rem"} alignItems={"center"}>
					<Typography sx={subscriptionStyle(pending)}>
						Number of seats:{" "}
						<Typography component='span'>
							{pending ? (
								<Skeleton variant='text' width={100} height={24} />
							) : (
								`${subscription?.quantity} seat${Number(subscription?.quantity) > 1 ? "s" : ""}`
							)}
						</Typography>
					</Typography>
				</Box>
				<ManageSeats />
			</Box>
			<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				{subscription?.seats.map((seat, index) => {
					const showExpired = index + 1 > subscription?.next_quantity;
					return (
						<Seat
							key={index}
							index={index}
							user={user}
							seat={seat}
							showExpired={showExpired}
							until={subscription?.next_charge_date}
						/>
					);
				})}
			</Box>
			<Divider sx={{ my: "1rem" }} />
			<PaymentDetails />
		</Box>
	);
}
