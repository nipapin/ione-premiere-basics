import { readdirSync, readFileSync } from "fs";
import path from "path";

type FileType = "video" | "audio";

export type TreeElement = {
	name: string;
	path: string;
	href: string;
	type: "folder" | FileType;
	children: TreeElement[];
	remove: boolean;
	media?: string;
	description?: string;
	counter?: number;
};

function getDirectoryTree(dirPath: string, parentName: string): TreeElement[] {
	const entries = readdirSync(dirPath, { withFileTypes: true });

	function getFileCount(entries: TreeElement[]): number {
		let count = 0;
		for (const entry of entries) {
			if (entry.type === "video" || entry.type === "audio") {
				count++;
			}

			if (entry.type === "folder") {
				count += getFileCount(entry.children);
			}
		}
		return count;
	}

	return entries
		.filter((entry) => entry.name.endsWith(".webm") || entry.name.endsWith(".wav") || entry.isDirectory())
		.map((entry) => {
			const entryName = entry.name.replace(/(\.webm|\.wav)$/, "");
			const children = entry.isDirectory()
				? getDirectoryTree(path.join(dirPath, entry.name), `${parentName}/${entry.name}`)
				: [];
			const fileType: FileType = entry.name.endsWith(".webm") ? "video" : "audio";
			const type: TreeElement["type"] = entry.isDirectory() ? "folder" : fileType;
			return {
				name: entryName,
				path: path.join(dirPath, entry.name),
				href: `${parentName}/${entry.name}`,
				type,
				children,
				remove: entry.isDirectory() && children.length === 0,
				media: entry.isFile() ? `/showcase/${encodeURIComponent(entry.name)}` : undefined,
				description: entry.name.endsWith(".webm") || entry.name.endsWith(".wav") ? entryName : undefined,
				counter: getFileCount(children)
			};
		})
		.filter((entry) => !entry.remove);
}

export const getShowcaseTree = () => {
	const treeJson = readFileSync(path.join(process.cwd(), "src/lib/showcase/tree.json"), "utf-8");
	if (treeJson) {
		return JSON.parse(treeJson);
	}

	const mdxDirectory = path.join(process.cwd(), "src/markdown/showcase");
	const tree = getDirectoryTree(mdxDirectory, "/showcase");
	return tree;
};
