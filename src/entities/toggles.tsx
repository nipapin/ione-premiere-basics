import { AlarmOn, AspectRatio, Bolt } from "@mui/icons-material";

type ToggleItem = {
	id: number;
	label: string;
	media: string;
	icon: React.ReactNode;
};

export const toggleItems: ToggleItem[] = [
	{
		id: 1,
		label: "Quick Customization",
		media: "/videos/features/controllers.mp4",
		icon: <Bolt />
	},
	{
		id: 2,
		label: "Adaptive Design",
		media: "/videos/features/autoresize.mp4",
		icon: <AspectRatio />
	},
	{
		id: 3,
		label: "Duration Control",
		media: "/videos/features/durationcontrol.mp4",
		icon: <AlarmOn />
	}
];

export const styles = {
	section: {
		display: { xl: "grid", xs: "flex" },
		flexDirection: { xl: "", xs: "column" },
		gridTemplateColumns: { xl: "auto auto", xs: "1fr" },
		alignContent: "center",
		maxWidth: "1280px",
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
		fontSize: "1rem"
	},
	buttonStack: {
		width: "100%",
		alignItems: { xl: "flex-start", md: "flex-end", sm: "flex-end" }
	},
	button: {
		width: { sm: "100%", xs: "100%" },
		textAlign: { xl: "start", xs: "center" },
		justifyContent: { xl: "flex-start", xs: "center" },
		padding: "1rem",
		textWrap: "nowrap"
	},
	imageWrapper: {
		"& video": {
			width: "100%",
			height: "auto",
			borderRadius: "8px",
			boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
		},
		width: { xs: "100%", sm: "auto" },
		height: { xs: "auto", sm: "100%" },
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
