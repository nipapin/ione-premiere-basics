"use client";

import { getBlogs } from "@/actions/blog";
import { Blog } from "@/entities/blogs";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type BlogFilterContextType = {
	selectedTags: string[];
	toggleTag: (tag: string) => void;
	blogs: Blog[];
	isLoading: boolean;
};

const BlogFilterContext = createContext<BlogFilterContextType>({
	selectedTags: [],
	toggleTag: () => {},
	blogs: [],
	isLoading: false
});

export default function BlogFilterProvider({ initBlogs, children }: { initBlogs: Blog[]; children: ReactNode }) {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [blogs, setBlogs] = useState<Blog[]>(initBlogs);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [updated, setUpdated] = useState<boolean>(false);

	const mergedTags = selectedTags.join(",").toLocaleLowerCase();

	const toggleTag = (tag: string) => {
		if (selectedTags.includes(tag)) {
			setSelectedTags(selectedTags.filter((t) => t !== tag));
		} else {
			setSelectedTags(Array.from(new Set([...selectedTags, tag])));
		}
		setUpdated(!updated);
	};

	useEffect(() => {
		const fetchBlogs = async () => {
			setIsLoading(true);
			const blogs = await getBlogs(mergedTags);
			console.log(blogs, mergedTags);
			setBlogs(blogs);
			setIsLoading(false);
		};
		fetchBlogs();
	}, [updated, mergedTags]);

	return (
		<BlogFilterContext.Provider value={{ selectedTags, toggleTag, blogs, isLoading }}>
			{children}
		</BlogFilterContext.Provider>
	);
}

export const useBlogFilter = () => {
	return useContext(BlogFilterContext);
};
