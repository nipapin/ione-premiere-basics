"use client";

import { useUser } from "@/contexts/UserWrapper";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import Title from "../ui/Title";

const formatPrice = (price: number, billingYearly: boolean, title: string) => {
	if (title === "Free Plan") return "Free";
	if (billingYearly && title === "Creator Plan") return `$${Number((price * 0.8).toFixed(1))}`;
	if (title === "Lifetime Access")
		return `$${Math.floor(Number(plans.find((plan) => plan.title === "Creator Plan")?.price) * 36 * 0.6)}`;
	return `$${price}`;
};

const buttonTitle: Record<string, string> = {
	"Free Plan": "Try for free",
	"Creator Plan": "Subscribe",
	"Lifetime Access": "Buy Now"
};

type UserData = {
	firstName: string;
	lastName: string;
	email: string;
	productId: number;
	user_id: string;
};

export default function PlansSection() {
	const { user } = useUser();
	const router = useRouter();
	const [billingYearly, setBillingYearly] = useState(true);

	const followPurchase = (productId: number) => () => {
		const hash = Buffer.from(productId.toString()).toString("base64");
		router.push(user ? `/charge-payment?after=${hash}` : `/signup?after=${hash}`);
	};

	return (
		<Wrapper component='section' sx={styles.section} fullWidth>
			<Title>{`Choose the plan\nthat fits your workflow`}</Title>
			<Typography
				sx={{ ...styles.subtitle, textWrap: "balance", whiteSpace: { sm: "pre", xs: "discard" } }}
			>{`Whether you're just starting out or editing every day — there's a plan for you.\nGet access to professional tools, regular updates, and everything you need to create faster.`}</Typography>
			<Wrapper sx={styles.plansGrid} fullWidth>
				{plans.map((plan, index) => {
					const isPro = plan.title === "Creator Plan";
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
										opacity: Number(plan.title === "Creator Plan"),
										pointerEvents: Number(plan.title === "Creator Plan") ? "auto" : "none"
									}}
									control={<Switch checked={billingYearly} onChange={() => setBillingYearly(!billingYearly)} />}
									label={
										billingYearly ? (
											<Typography>
												Billing Yearly{" "}
												<Typography component={"span"} fontWeight={"bold"}>
													$191
												</Typography>{" "}
												<Typography component={"span"} fontWeight={"bold"} color={"primary"}>
													save 20%
												</Typography>
											</Typography>
										) : (
											<Typography fontSize={"0.95rem"}>
												Billing Monthly{" "}
												<Typography component={"span"} fontWeight={"bold"}>
													Save 20% with annual billing
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
