import { useUser } from "@/contexts/UserWrapper";
import { InviteDetailsProps } from "@/types/interfaces";
import { Box, Button, Divider, Skeleton, Typography } from "@mui/material";

const subscriptionStyle = (pending: boolean) => ({
	display: "flex",
	alignItems: "center",
	gap: "0.5rem",
	"& span.underline": pending ? {} : { color: "var(--primary)", textDecoration: "underline" }
});

export default function InviteDetails({ subscription, pending }: InviteDetailsProps) {
	const user = useUser();
	const freeSeat = () => {
		fetch("/api/subscription/manage-seat", {
			method: "POST",
			body: JSON.stringify({ subscription, email: user?.email })
		}).then((res) => {
			if (res.ok) {
				window.location.reload();
			}
		});
	};

	return (
		<Box>
			<Typography variant='h1' fontWeight='bold' fontSize={"1.2rem"}>
				Order details
			</Typography>
			<Divider sx={{ my: "1rem" }} />
			<Box display={"flex"} flexDirection={"column"} gap={"1rem"} my={"1rem"}>
				<Typography sx={subscriptionStyle(pending)}>
					Status:{" "}
					{pending ? (
						<Skeleton variant='text' width={100} height={24} />
					) : (
						<>
							<Typography component='span' className='underline'>
								{subscription?.status}
							</Typography>
							<Typography component='span' className='email'>
								from {subscription?.seats[0]}
							</Typography>
						</>
					)}
				</Typography>
				<Typography sx={subscriptionStyle(pending)}>
					Type:{" "}
					{pending ? (
						<Skeleton variant='text' width={100} height={24} />
					) : (
						<Typography component='span' className='underline'>
							{subscription?.order_item_name}
						</Typography>
					)}
				</Typography>
			</Box>
			<Button fullWidth variant='contained' sx={{ borderRadius: "0.5rem", mt: "1rem" }} onClick={freeSeat}>
				Reject seat
			</Button>
		</Box>
	);
}
