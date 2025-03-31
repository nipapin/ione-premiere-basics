type PowerfulTool = {
	id: number;
	label: string;
	media: string;
};

export const powerfulTools: PowerfulTool[] = [
	{ id: 1, label: "Transitions", media: "/images/cover-poster.webp" },
	{ id: 2, label: "Effects", media: "/images/cover-poster.webp" },
	{ id: 3, label: "Motion Graphics", media: "/images/cover-poster.webp" },
	{ id: 4, label: "Sound FX", media: "/images/cover-poster.webp" },
	{ id: 5, label: "Assets", media: "/images/cover-poster.webp" }
];

export const styles = {
	section: {
		display: "flex",
		alignItems: "center",
		flexDirection: "column",
		gap: "2rem"
	},
	title: {
		fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
		fontWeight: 400,
		textAlign: "center"
	},
	toolsGrid: {
		display: "grid",
		gridTemplateColumns: {
			xs: "repeat(6, 1fr)",
			sm: "repeat(6, 1fr)",
			md: `repeat(${powerfulTools.length}, 1fr)`
		},
		gap: { xs: "0.5rem", sm: "1rem" },
		width: "100%",
		maxWidth: "md",
		margin: "0 auto"
	},
	toolButton: (isActive: boolean, index: number) => ({
		color: isActive ? "var(--primary)" : "currentColor",
		borderColor: isActive ? "var(--primary)" : "currentColor",
		borderWidth: "1px",
		padding: { xs: "0.5rem", sm: "1rem" },
		transition: "all 0.3s ease",
		gridColumn: { md: "span 1", sm: `span ${Math.floor(index / 3) + 2}`, xs: `span ${Math.floor(index / 3) + 2}` }
	}),
	imageContainer: {
		width: "100%",
		maxWidth: "1100px",
		aspectRatio: "16/9",
		height: "auto",
		display: "flex",
		"& img": {
			width: "100%",
			height: "auto",
			borderRadius: "8px",
			boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
		}
	}
};
