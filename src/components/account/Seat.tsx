import { User } from "@/types/interfaces";
import { Check, Edit } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Typography
} from "@mui/material";
import { useEffect, useState } from "react";

interface ISeat {
	index: number;
	user: User | null;
	seat: string;
	showExpired: boolean;
	until: string;
}

export const Seat = ({ index, user, seat, showExpired, until }: ISeat) => {
	const [edit, setEdit] = useState(false);
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState(seat);
	const [loading, setLoading] = useState(false);
	const [exists, setExists] = useState(false);

	const toggleEdit = () => {
		if (edit && seat !== email) {
			setOpen(true);
			return;
		}
		setLoading(false);
		setEdit(!edit);
	};

	const assignSeat = () => {
		fetch("/api/subscription/manage-seat", {
			method: "PUT",
			body: JSON.stringify({ user, email, seat: index })
		});
		setEdit(false);
		setOpen(false);
		window.location.reload();
	};

	const freeSeat = () => {
		fetch("/api/subscription/manage-seat", {
			method: "DELETE",
			body: JSON.stringify({ user, email: seat, seat: index })
		});
		setEdit(false);
		setOpen(false);
		window.location.reload();
	};

	useEffect(() => {
		if (index === 0) {
			setLoading(false);
			setExists(false);
			return;
		}
		if (!email) {
			setLoading(false);
			setExists(false);
			return;
		}
		setLoading(true);
		setExists(false);
		const timeout = setTimeout(() => {
			fetch("/api/subscription/check-email", {
				method: "POST",
				body: JSON.stringify({ email })
			})
				.then((res) => res.json())
				.then((data) => {
					setExists(data.exists);
					setLoading(false);
				});
		}, 1000);
		return () => clearTimeout(timeout);
	}, [email, index]);

	return (
		<Box display={"flex"} flexDirection={"column"} gap={"1rem"}>
			<Typography>
				Seat {index + 1}{" "}
				{showExpired && (
					<Typography component={"span"} fontSize={"0.8rem"} fontWeight={"200"} color='primary'>
						{until}
					</Typography>
				)}
			</Typography>
			<Box display={"flex"} flexDirection={"row"} gap={"0.5rem"} alignItems={"center"}>
				<TextField
					disabled={index === 0 || !edit}
					variant='outlined'
					value={index === 0 ? user?.email : email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder='Enter email'
					fullWidth
					slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
				/>
				{index > 0 && (
					<>
						<IconButton disabled={loading || exists} sx={{ ml: "auto" }} onClick={toggleEdit}>
							{edit ? loading ? <CircularProgress size={20} /> : <Check fontSize='small' /> : <Edit fontSize='small' />}
						</IconButton>
					</>
				)}
			</Box>
			{exists && edit && !loading && (
				<Alert severity='error' sx={{ alignItems: "center" }}>
					User already has subscription
				</Alert>
			)}
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				slotProps={{ paper: { elevation: 1, sx: { borderRadius: "0.5rem" } } }}
			>
				<DialogTitle>{email ? "Assign seat" : "Free seat"}</DialogTitle>
				<DialogContent>
					{email ? (
						<Typography>
							You are about to assign a seat to <strong>{email}</strong>.<br />
							This will send an email to the user with an invitation link.
						</Typography>
					) : (
						<Typography>
							You are about to free a seat.
							<br />
							User <strong>{email}</strong> will lose access to the subscription.
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button variant='contained' sx={{ borderRadius: "0.5rem" }} onClick={email ? assignSeat : freeSeat}>
						Confirm
					</Button>
					<Button variant='outlined' sx={{ borderRadius: "0.5rem" }} onClick={() => setOpen(false)}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
