"use client";

import { useUser } from "@/contexts/UserWrapper";
import { ISubscriptionDetails } from "@/types/interfaces";
import { Box, Button, Divider, Skeleton, Typography } from "@mui/material";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import InviteDetails from "./InviteDetails";
import PrimaryDetails from "./PrimaryDetails";
import { parseSubscriptionDate } from "@/lib/subscription-date";

export default function SubscriptionDetails() {
	const { user } = useUser();

	const [pending, setPending] = useState(true);
	const [subscription, setSubscription] = useState<ISubscriptionDetails>();

	useEffect(() => {
		const formatDate = (date: string) => {
			return date
				? "until " +
				parseSubscriptionDate(date)?.toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				})
				: "Lifetime";
		};
		const fetchDetails = async () => {
			const response = await fetch("/api/subscription/details", {
				method: "POST",
				body: JSON.stringify({
					user_id: user?.user_id,
				}),
			});
			const data = await response.json();
			if (data.type === "none") {
				setSubscription({ ...data, type: "none" });
				return;
			}
			if (data.type === "primary") {
				const quantity = Number(data.quantity);
				const nextChargeDate = formatDate(data.next_charge_date);
				setSubscription({ ...data, quantity, next_charge_date: nextChargeDate });
			} else if (data.type === "invite") {
				setSubscription(data);
			}
		};
		fetchDetails().finally(() => setPending(false));
	}, [user?.paypro_customer_id, user?.user_id]);

	const details = {
		primary: <PrimaryDetails subscription={subscription} user={user!} pending={pending} />,
		invite: <InviteDetails subscription={subscription} user={user!} pending={pending} />,
		none: (
			<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				<Typography variant="h1" fontWeight="bold" fontSize={"1.2rem"}>
					Order details
				</Typography>
				<Divider sx={{ my: "1rem" }} />
				<Typography>{`You don't have any products.`}</Typography>
				<NextLink href="/pricing" passHref>
					<Button variant="contained" sx={{ borderRadius: "0.5rem" }}>
						Order now
					</Button>
				</NextLink>
			</Box>
		),
	};

	return (
		details[subscription?.type as keyof typeof details] || (
			<Box>
				<Typography variant="h1" fontWeight="bold" fontSize={"1.2rem"}>
					Order details
				</Typography>
				<Divider sx={{ my: "1rem" }} />
				<Box display={"flex"} flexDirection={"column"} gap={"0.5rem"}>
					{Array.from({ length: 4 }).map((_, index) => (
						<Skeleton
							variant="text"
							animation="wave"
							width={index === 3 ? "50%" : "100%"}
							height={32}
							key={index}
							sx={{ animationDelay: `${index * 16}ms` }}
						/>
					))}
				</Box>
			</Box>
		)
	);
}
