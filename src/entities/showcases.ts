const createRow = (...args: string[]) => [...args];

export const rows: string[][] = [
	createRow("element_1", "element_1", "element_1", "element_1", "element_1"),
	createRow("element_1", "element_1", "element_1", "element_1", "element_1"),
	createRow("element_1", "element_1", "element_1", "element_1", "element_1")
];

export const styles = {
	tracks: {
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: "1rem",
		"--border-radius": "1rem",
		py: "4rem",
		width: "100%",
		maxWidth: "1280px"
	},
	box: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		justifyContent: "center",
		gap: "1rem",
		position: "relative",
		width: "100%",
		maxWidth: "1280px",
		overflow: "hidden",
		"&::before": {
			content: `""`,
			display: "block",
			width: "100%",
			height: "100%",
			position: "absolute",
			left: 0,
			top: 0,
			background:
				"linear-gradient(90deg, var(--background) 0%, transparent 25%, transparent 75%, var(--background) 100%)",
			zIndex: 1,
			pointerEvents: "none"
		}
	}
};
