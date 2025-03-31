type ToggleItem = {
	id: number;
	label: string;
	media: string;
};

export const toggleItems: ToggleItem[] = [
	{
		id: 1,
		label: "Scale your business and sales model",
		media: "/images/cover-poster.webp"
	},
	{
		id: 2,
		label: "Lorem ipsum dolor sit amet, consectetur adipiscing",
		media: "/images/cover-poster.webp"
	},
	{
		id: 3,
		label: "Scale your business with sales assembly",
		media: "/images/cover-poster.webp"
	}
];

export const styles = {
	section: {
		display: { xl: "grid", xs: "flex" },
		flexDirection: { xl: "", xs: "column" },
		gridTemplateColumns: { xl: "auto auto", xs: "1fr" },
		alignContent: "center",
		maxWidth: "1200px",
		gap: "3rem",
		py: "4rem"
	},
	contentWrapper: {
		display: "flex",
		flexDirection: { xl: "column", sm: "row", xs: "column" },
		alignItems: { sm: "center", xs: "flex-start" },
		justifyContent: { xl: "center", xs: "space-between" },
		width: "100%",
		gap: { md: "2rem", sm: "1rem" }
	},
	heading: {
		fontWeight: 400,
		whiteSpace: "pre",
		fontSize: { xl: "2.5rem", md: "2rem", xs: "1.75rem" },
		mb: "1rem"
	},
	subheading: {
		fontWeight: 200,
		whiteSpace: "pre",
		mb: "2rem",
		fontSize: { xl: "1.25rem", md: "1.1rem", xs: "1rem" }
	},
	buttonStack: {
		width: "100%",
		alignItems: { xl: "flex-start", md: "flex-end", sm: "flex-end" }
	},
	button: {
		width: { sm: "fit-content", xs: "100%" },
		textAlign: { xl: "start", xs: "center" },
		justifyContent: { xl: "flex-start", xs: "center" },
		padding: "1rem",
		textWrap: "nowrap"
	},
	imageWrapper: {
		"& img": {
			width: "100%",
			height: "auto",
			borderRadius: "8px",
			boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
		},
		width: "auto",
		height: "100%",
		aspectRatio: "16/9",
		m: "none",
		ml: { xl: "auto", md: "none" }
	},
	textWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: "rem",
		alignItems: { sm: "flex-start", xs: "center" },
		width: "100%"
	}
};
