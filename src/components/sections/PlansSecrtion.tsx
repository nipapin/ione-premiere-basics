"use client";

import { plans, styles } from "@/entities/plans";
import { CheckCircle } from "@mui/icons-material";
import {
	Button,
	FormControlLabel,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Switch,
	Typography
} from "@mui/material";
import { useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import Title from "../ui/Title";

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
};

const purchaseLink = (userData: UserData) =>
	`https://store.payproglobal.com/checkout?products[1][id]=${userData.productId}&page-template=13366&currency=USD&billing-first-name=${userData.firstName}&billing-last-name=${userData.lastName}&billing-email=${userData.email}`;

export default function PlansSection() {
	const [billingYearly, setBillingYearly] = useState(true);
	const [open, setOpen] = useState(false);
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
								<Button
									fullWidth
									// href={plan.action}
									variant='contained'
									sx={styles.actionButton}
									href={purchaseLink({
										firstName: "Nikita",
										lastName: "Papin",
										email: "papin201212@gmail.com",
										productId: key
									})}
									target='_blank'
								>
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
