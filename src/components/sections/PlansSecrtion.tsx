import { CheckCircle } from "@mui/icons-material";
import { Button, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Wrapper } from "../layout/Wrapper";

type Plan = {
	id: number;
	title: string;
	description: string;
	price: number;
	per: string;
	benefits: string[];
	action: string;
};

const plans: Plan[] = [
	{
		id: 1,
		title: "Basic",
		description: "During this phase the design is developed\nto meet the required technical standards to",
		price: 11,
		per: "month",
		benefits: ["Core engagement survey", "Topic-based assessments", "Custom topic-based assessments", "Filterable heatmap & analytics"],
		action: "#"
	},
	{
		id: 2,
		title: "Business",
		description: "During this phase the design is developed\nto meet the required technical standards to",
		price: 86,
		per: "year",
		benefits: ["Core engagement survey", "Topic-based assessments", "Custom topic-based assessments", "Filterable heatmap & analytics"],
		action: "#"
	},
	{
		id: 3,
		title: "Premium",
		description: "During this phase the design is developed\nto meet the required technical standards to",
		price: 250,
		per: "lifetime",
		benefits: ["Core engagement survey", "Topic-based assessments", "Custom topic-based assessments", "Filterable heatmap & analytics"],
		action: "#"
	}
];

const styles = {
	section: {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		alignItems: "center",
		py: { xs: "2rem", md: "4rem" },
		maxWidth: { xl: "70vw", md: "none" }
	},
	title: {
		fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
		fontWeight: 400,
		textAlign: "center",
		mb: { xs: "1rem", md: "2rem" }
	},
	subtitle: {
		whiteSpace: "pre",
		mb: { xs: "1.5rem", md: "2rem" },
		textAlign: "center",
		fontSize: { xs: "0.9rem", sm: "1rem" }
	},
	plansGrid: {
		display: "grid",
		gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" },
		gap: { xs: 2, md: 4 }
	},
	planCard: {
		height: "100%",
		transition: "transform 0.3s ease-in-out",
		"&:hover": {
			transform: "translateY(-8px)"
		}
	},
	planContent: {
		background: "var(--background-gradient)",
		p: { xs: "1.5rem", md: "2rem" },
		height: "100%",
		display: "flex",
		flexDirection: "column",
		borderRadius: "12px",
		boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
	},
	planTitle: {
		fontSize: { xs: "1.5rem", md: "2rem" },
		fontWeight: 600,
		mb: { xs: "1rem", md: "1.5rem" }
	},
	planDescription: {
		whiteSpace: "pre",
		fontWeight: 200,
		mb: { xs: "1.5rem", md: "2rem" },
		fontSize: { xs: "0.8rem", sm: "0.865rem", md: "1rem" }
	},
	planPrice: {
		fontSize: { xs: "3rem", sm: "4rem" },
		fontWeight: 400,
		mb: { xs: "1.5rem", md: "2rem" },
		"& span": {
			fontSize: { xs: "0.8rem", sm: "1rem" },
			fontWeight: 200
		}
	},
	includesTitle: {
		textTransform: "uppercase",
		mt: { xs: "2rem", md: "4rem" },
		fontSize: { xs: "0.9rem", sm: "1rem" },
		fontWeight: 500
	},
	benefitsList: {
		mb: { xs: "1.5rem", md: "2rem" }
	},
	benefitItem: {
		my: { xs: "0.5rem", sm: "1rem" }
	},
	benefitIcon: {
		minWidth: 0,
		mr: { xs: "0.5rem", sm: "1rem" }
	},
	actionButton: {
		mt: "auto",
		py: { xs: "0.8rem", sm: "1rem" },
		fontSize: { xs: "0.9rem", sm: "1rem" }
	}
};

export default function PlansSection() {
	return (
		<Wrapper component='section' sx={styles.section} fullWidth>
			<Typography sx={styles.title}>Compare our plans</Typography>
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
