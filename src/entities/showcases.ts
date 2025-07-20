export interface RowItem {
	source: string;
	poster: string;
}

type Row = RowItem[];

const basePath = "/videos/showcase/Slide_";
const sourceExtension = ".mp4";
const posterExtension = ".png";
const rowsCount = 3;
const itemsPerRow = 5;

const nf = (value: number) => value.toString().padStart(2, "0");

const createRow = (rowIndex: number): Row => [
	...Array.from({ length: itemsPerRow }).map((_, index) => {
		const source = `${basePath}${nf(rowIndex * itemsPerRow + index + 1)}${sourceExtension}`;
		const poster = `${basePath}${nf(rowIndex * itemsPerRow + index + 1)}${posterExtension}`;
		return { source, poster };
	})
];

export const rows: Row[] = Array.from({ length: rowsCount }).map((_, index) => createRow(index));

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
		py: "4px",
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
