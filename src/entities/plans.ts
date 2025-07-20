type Plan = {
	id: number[];
	title: string;
	description: string;
	price: number;
	per: string;
	benefits: string[];
	action: string;
};

export const plans: Plan[] = [
	{
		id: [/*113884*/ 114910],
		title: "Free Trial",
		description:
			"Explore the full power of the extension for 7 days — transitions, titles, effects, and more.\nPerfect for testing it in real projects before committing",
		price: 0,
		per: "",
		benefits: [
			"7-day full access to all features",
			"Use across Premiere Pro & After Effects",
			"No watermark, no limitations",
			"One-click installation & editing"
		],
		action: "#"
	},
	{
		id: [111867, 113886],
		title: "Creator Plan",
		description:
			"Full access to all features, categories, and future updates.\nDesigned for creators who edit regularly and want top-tier performance without limits.",
		price: 19.9,
		per: "month",
		benefits: [
			"Unlimited access to all features and categories",
			"Regular monthly content updates",
			"Fast support",
			"Commercial use license"
		],
		action: "#"
	},
	{
		id: [113887],
		title: "Lifetime Access",
		description:
			"Pay once and use the full extension forever — with free updates included.\nIdeal for professionals and teams who want long-term value and full control.",
		price: 250,
		per: "lifetime",
		benefits: [
			"One-time payment, lifetime access",
			"All current and future features unlocked",
			"Priority support",
			"Full commercial license for unlimited projects"
		],
		action: "#"
	}
];

export const styles = {
	section: {
		"--border-radius": "1rem",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: "1rem",
		maxWidth: "1280px",
		width: "100%"
	},
	title: {
		fontSize: "4rem",
		fontWeight: 400,
		textAlign: "center"
	},
	subtitle: {
		whiteSpace: "pre",
		textAlign: "center",
		fontSize: "1rem",
		mt: "-1rem"
	},
	plansGrid: {
		display: "grid",
		gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" },
		gap: "1rem",
		maxWidth: "1280px",
		mt: "2rem"
	},
	planCard: {
		height: "100%",
		transition: "transform 0.3s ease-in-out",
		"&:hover": {
			transform: "translateY(0px)"
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
		fontWeight: 400,
		mb: { xs: "1rem", md: "1.5rem" }
	},
	planDescription: {
		textWrap: "wrap",
		fontWeight: 200,
		mb: { xs: "1.5rem", md: "2rem" },
		fontSize: { xs: "0.8rem", sm: "0.865rem", md: "0.9rem" }
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
		mt: { xs: "2rem", md: "3rem" },
		fontSize: { xs: "0.9rem", sm: "1rem" },
		fontWeight: 400
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
