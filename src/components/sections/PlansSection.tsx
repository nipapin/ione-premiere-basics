"use client";

import { useUser } from "@/contexts/UserWrapper";
import { plans, styles } from "@/entities/plans";
import { CheckCircle } from "@mui/icons-material";
import {
	Button,
	FormControlLabel,
	Hidden,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Switch,
	Typography
} from "@mui/material";
import { FormEvent, useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import Title from "../ui/Title";
import { useRouter } from "next/navigation";

const formatPrice = (price: number, billingYearly: boolean, title: string) => {
	if (title === "Trial") return "Free";
	if (billingYearly && title === "Pro") return `$${Number((price * 0.8).toFixed(1))}`;
	if (title === "Infinite")
		return `$${Math.floor(Number(plans.find((plan) => plan.title === "Pro")?.price) * 36 * 0.6)}`;
	return `$${price}`;
};

const buttonTitle: Record<string, string> = {
	Trial: "7-day Free Trial",
	Pro: "Subscribe",
	Infinite: "Buy Now"
};

type UserData = {
	firstName: string;
	lastName: string;
	email: string;
	productId: number;
	user_id: string;
};

const purchaseLink = (userData: UserData) => {
	const payload = Buffer.from(
		Object.entries(userData)
			.map(([key, value]) => `${key}=${value}`)
			.join("&")
	).toString("base64");
	return `/charge-payment?payload=${payload}`;
};

export default function PlansSection() {
	const user = useUser();
	const router = useRouter();
	const [billingYearly, setBillingYearly] = useState(true);
	const [open, setOpen] = useState(false);

	const followPurchase = (productId: number) => () => {
		const hash = Buffer.from(productId.toString()).toString("base64");
		router.push(user ? `/charge-payment?after=${hash}` : `/signup?after=${hash}`);
	};

	return (
		<Wrapper component='section' sx={styles.section} fullWidth>
			<Title>Compare our plans</Title>
			<Typography
				sx={styles.subtitle}
			>{`Premiere Basics is a strategic branding agency\nfocused on brand creation, rebrands, and brand`}</Typography>
			<Wrapper sx={styles.plansGrid} fullWidth>
				{plans.map((plan, index) => {
					const isPro = plan.title === "Pro";
					const key: number = isPro ? plan.id[Number(billingYearly)] : plan.id[0];
					return (
						<Wrapper key={key} sx={styles.planCard} variant='animated' angleOffset={90 * index} fullWidth>
							<Wrapper sx={styles.planContent} fullWidth>
								<Typography sx={styles.planTitle}>{plan.title}</Typography>
								<Typography sx={styles.planDescription}>{plan.description}</Typography>
								<Typography sx={styles.planPrice}>
									{formatPrice(plan.price, billingYearly, plan.title)} {plan.per && <span>/ {plan.per}</span>}
								</Typography>
								<FormControlLabel
									sx={{
										opacity: Number(plan.title === "Pro"),
										pointerEvents: Number(plan.title === "Pro") ? "auto" : "none"
									}}
									control={<Switch checked={billingYearly} onChange={() => setBillingYearly(!billingYearly)} />}
									label={
										billingYearly ? (
											<Typography>
												Billing Yearly{" "}
												<Typography component={"span"} fontWeight={"bold"}>
													20%+ off
												</Typography>
											</Typography>
										) : (
											<Typography>
												Billing Monthly{" "}
												<Typography component={"span"} fontWeight={"bold"}>
													Save 20%+ with yearly billing
												</Typography>
											</Typography>
										)
									}
								/>
								<Typography sx={styles.includesTitle}>{`What's includes`}</Typography>
								<List sx={styles.benefitsList}>
									{plan.benefits.map((benefit) => {
										return (
											<ListItem key={benefit} disablePadding sx={styles.benefitItem}>
												<ListItemIcon sx={styles.benefitIcon}>
													<CheckCircle color='primary' />
												</ListItemIcon>
												<ListItemText>{benefit}</ListItemText>
											</ListItem>
										);
									})}
								</List>
								<Button fullWidth variant='contained' sx={styles.actionButton} onClick={followPurchase(key)}>
									{buttonTitle[plan.title]}
								</Button>
							</Wrapper>
						</Wrapper>
					);
				})}
			</Wrapper>
		</Wrapper>
	);
}
