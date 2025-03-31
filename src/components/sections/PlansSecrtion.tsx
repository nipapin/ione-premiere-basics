import { CheckCircle } from "@mui/icons-material";
import { Button, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Wrapper } from "../layout/Wrapper";
import { plans, styles } from "@/entities/plans";
import Title from "../ui/Title";

export default function PlansSection() {
	return (
		<Wrapper component='section' sx={styles.section} fullWidth>
			<Title>Compare our plans</Title>
			{/* <Typography sx={styles.title}>Compare our plans</Typography> */}
			<Typography sx={styles.subtitle}>{`Premiere Basics is a strategic branding agency\nfocused on brand creation, rebrands, and brand`}</Typography>
			<Wrapper sx={styles.plansGrid} fullWidth>
				{plans.map((plan, index) => {
					return (
						<Wrapper key={plan.id} sx={styles.planCard} variant='animated' angleOffset={90 * index} fullWidth>
							<Wrapper sx={styles.planContent} fullWidth>
								<Typography sx={styles.planTitle}>{plan.title}</Typography>
								<Typography sx={styles.planDescription}>{plan.description}</Typography>
								<Typography sx={styles.planPrice}>
									${plan.price} <span>/ {plan.per}</span>
								</Typography>
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
								<Button fullWidth href={plan.action} variant='contained' sx={styles.actionButton}>
									Start Now
								</Button>
							</Wrapper>
						</Wrapper>
					);
				})}
			</Wrapper>
		</Wrapper>
	);
}
