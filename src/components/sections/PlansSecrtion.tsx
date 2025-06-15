"use client";

import { plans, styles } from "@/entities/plans";
import { CheckCircle } from "@mui/icons-material";
import {
	Button,
	Dialog,
	FormControlLabel,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Switch,
	Typography
} from "@mui/material";
import { Wrapper } from "../layout/Wrapper";
import Title from "../ui/Title";
import { useState } from "react";

const formatPrice = (price: number, billingYearly: boolean, title: string) => {
	if (billingYearly && title === "Pro") return Math.floor(price * 0.8);
	if (title === "Infinite") return Math.floor(Number(plans.find((plan) => plan.title === "Pro")?.price) * 24);
	return price;
};

const buttonTitle: Record<string, string> = {
	Free: "Get Started",
	Pro: "Subscribe",
	Infinite: "Buy Now"
};

type UserData = {
	firstName: string;
	lastName: string;
	email: string;
};

const purchaseLink = (userData: UserData) =>
	`https://store.payproglobal.com/checkout?products[1][id]=111867&page-template=12342&currency=USD&billing-first-name=${userData.firstName}&billing-last-name=${userData.lastName}&billing-email=${userData.email}`;

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
					return (
						<Wrapper key={plan.id} sx={styles.planCard} variant='animated' angleOffset={90 * index} fullWidth>
							<Wrapper sx={styles.planContent} fullWidth>
								<Typography sx={styles.planTitle}>{plan.title}</Typography>
								<Typography sx={styles.planDescription}>{plan.description}</Typography>
								<Typography sx={styles.planPrice}>
									${formatPrice(plan.price, billingYearly, plan.title)} {plan.per && <span>/ {plan.per}</span>}
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
									href={plan.action}
									variant='contained'
									sx={styles.actionButton}
									onClick={() => setOpen(true)}
								>
									{buttonTitle[plan.title]}
								</Button>
							</Wrapper>
						</Wrapper>
					);
				})}
			</Wrapper>
			<Dialog open={open} onClose={() => setOpen(false)} fullWidth>
				<iframe
					src={purchaseLink({ firstName: "John", lastName: "Doe", email: "john@doe.com" })}
					style={{ width: "100%", height: "100%", border: "none" }}
				/>
			</Dialog>
		</Wrapper>
	);
}
