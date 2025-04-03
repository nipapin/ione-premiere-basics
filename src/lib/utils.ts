import { convertChunkToTypo } from "@/components/help/utils";
import { readdirSync, readFileSync } from "fs";
import matter from "gray-matter";
import path from "path";

export type TreeElement = {
	name: string;
	path: string;
	href: string;
	type: "folder" | "file";
	children: TreeElement[];
	order: number;
};

function getDirectoryTree(dirPath: string, parentName: string): TreeElement[] {
	const entries = readdirSync(dirPath, { withFileTypes: true });

	return entries.map((entry) => {
		const entryName = convertChunkToTypo(entry.name.replace(".mdx", ""));
		let order = 0;
		if (entry.isFile()) {
			const mdxSource = readFileSync(`${dirPath}/${entry.name}`, "utf-8");
			const { data } = matter(mdxSource);
			order = data.order;
		}
		return {
			name: entryName,
			path: path.join(dirPath, entry.name),
			type: entry.isDirectory() ? "folder" : "file",
			href: `${parentName}/${entry.name.replace(".mdx", "")}`,
			children: entry.isDirectory()
				? getDirectoryTree(path.join(dirPath, entry.name), `${parentName}/${entry.name}`).sort((a, b) => a.order - b.order)
				: [],
			order,
		};
	});
}

export const getDocsTree = () => {
	const mdxDirectory = path.join(process.cwd(), "src/markdown/help");
	return getDirectoryTree(mdxDirectory, "/help");
};
