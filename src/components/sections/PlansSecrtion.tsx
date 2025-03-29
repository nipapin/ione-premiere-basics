import { CheckCircle } from "@mui/icons-material";
import {
	Button,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Typography
} from "@mui/material";
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
		description:
			"During this phase the design is developed\nto meet the required technical standards to",
		price: 11,
		per: "month",
		benefits: [
			"Core engagement survey",
			"Topic-based assessments",
			"Custom topic-based assessments",
			"Filterable heatmap & analytics"
		],
		action: "#"
	},
	{
		id: 2,
		title: "Business",
		description:
			"During this phase the design is developed\nto meet the required technical standards to",
		price: 86,
		per: "year",
		benefits: [
			"Core engagement survey",
			"Topic-based assessments",
			"Custom topic-based assessments",
			"Filterable heatmap & analytics"
		],
		action: "#"
	},
	{
		id: 3,
		title: "Premium",
		description:
			"During this phase the design is developed\nto meet the required technical standards to",
		price: 250,
		per: "lifetime",
		benefits: [
			"Core engagement survey",
			"Topic-based assessments",
			"Custom topic-based assessments",
			"Filterable heatmap & analytics"
		],
		action: "#"
	}
];

export default function PlansSection() {
	return (
		<Wrapper
			component={"section"}
			display='flex'
			flexDirection='column'
			gap={2}
			alignItems='center'
			py='4rem'
			fullWidth
			maxWidth={{ xl: "70vw", md: "none" }}
		>
			<Typography
				fontSize={{ md: "4rem", xs: "3rem" }}
				fontWeight={400}
				textAlign={"center"}
			>
				Compare our plans
			</Typography>
			<Typography
				whiteSpace={"pre"}
				mb='2rem'
				textAlign={"center"}
			>{`Premiere Basics is a strategic branding agency\nfocused on brand creation, rebrands, and brand`}</Typography>
			<Wrapper
				display={"grid"}
				gridTemplateColumns={{ md: "1fr 1fr 1fr", xs: "1fr" }}
				fullWidth
				gap={4}
			>
				{plans.map((plan, index) => {
					return (
						<Wrapper
							fullWidth
							key={plan.id}
							variant='animated'
							angleOffset={90 * index}
						>
							<Wrapper
								fullWidth
								sx={{
									background: "var(--background-gradient)",
									p: { md: "2rem", xs: "1rem" }
								}}
							>
								<Typography variant='h3'>{plan.title}</Typography>
								<Typography
									whiteSpace={"pre"}
									fontWeight={200}
									mb={"2rem"}
									fontSize={{ xl: "1rem", md: "0.865rem" }}
								>
									{plan.description}
								</Typography>
								<Typography
									fontSize='4rem'
									fontWeight={400}
									sx={{ "& span": { fontSize: "1rem", fontWeight: 200 } }}
									mb='2rem'
								>
									${plan.price} <span>/ {plan.per}</span>
								</Typography>
								<Typography textTransform='uppercase' mt='4rem'>
									{`What's includes`}
								</Typography>
								<List sx={{ mb: "2rem" }}>
									{plan.benefits.map((benefit) => {
										return (
											<ListItem
												key={benefit}
												disablePadding
												sx={{ my: "1rem" }}
											>
												<ListItemIcon sx={{ minWidth: 0, mr: "1rem" }}>
													<CheckCircle color='primary' />
												</ListItemIcon>
												<ListItemText>{benefit}</ListItemText>
											</ListItem>
										);
									})}
								</List>
								<Button fullWidth href={plan.action} variant='contained'>
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
