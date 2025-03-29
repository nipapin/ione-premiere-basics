import { convertChunkToTypo } from "@/components/help/utils";
import { readdirSync } from "fs";
import path from "path";

export type TreeElement = {
	name: string;
	path: string;
	href: string;
	type: "folder" | "file";
	children: TreeElement[];
};

function getDirectoryTree(dirPath: string, parentName: string): TreeElement[] {
	const entries = readdirSync(dirPath, { withFileTypes: true });

	return entries.map((entry) => {
		const entryName = convertChunkToTypo(entry.name.replace(".mdx", ""));
		return {
			name: entryName,
			path: path.join(dirPath, entry.name),
			type: entry.isDirectory() ? "folder" : "file",
			href: `${parentName}/${entry.name.replace(".mdx", "")}`,
			children: entry.isDirectory()
				? getDirectoryTree(
						path.join(dirPath, entry.name),
						`${parentName}/${entry.name}`
				  )
				: []
		};
	});
}

export const getDocsTree = () => {
	const mdxDirectory = path.join(process.cwd(), "src/markdown");
	return getDirectoryTree(mdxDirectory, "/help");
};
