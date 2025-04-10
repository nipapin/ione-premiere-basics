import { Dirent, readdirSync } from "fs";
import path from "path";

export type TreeElement = {
	name: string;
	path: string;
	href: string;
	type: "folder" | "file";
	children: TreeElement[];
	remove: boolean;
	media?: string;
	description?: string;
	counter?: number;
};

function getDirectoryTree(dirPath: string, parentName: string): TreeElement[] {
	const entries = readdirSync(dirPath, { withFileTypes: true });

	function getWebmCount(entries: TreeElement[]): number {
		let count = 0;
		for (const entry of entries) {
			if (entry.type === "file") {
				count++;
			}
			if (entry.type === "folder") {
				count += getWebmCount(entry.children);
			}
		}
		return count;
	}

	return entries
		.filter((entry) => entry.name.endsWith(".webm") || entry.isDirectory())
		.map((entry) => {
			const entryName = entry.name.replace(".webm", "");
			const children = entry.isDirectory()
				? getDirectoryTree(path.join(dirPath, entry.name), `${parentName}/${entry.name}`)
				: [];
			return {
				name: entryName,
				path: path.join(dirPath, entry.name),
				type: entry.isDirectory() ? ("folder" as const) : ("file" as const),
				href: `${parentName}/${entry.name.replace(".webm", "")}`,
				children,
				remove: entry.isDirectory() && children.length === 0,
				media: entry.name.endsWith(".webm") ? `/showcase/${encodeURIComponent(entry.name)}` : undefined,
				description: entry.name.endsWith(".webm") ? entry.name.replace(".webm", "") : undefined,
				counter: getWebmCount(children)
			};
		})
		.filter((entry) => !entry.remove);
}

export const getShowcaseTree = () => {
	const mdxDirectory = path.join(process.cwd(), "src/markdown/showcase");
	return getDirectoryTree(mdxDirectory, "/showcase");
};
