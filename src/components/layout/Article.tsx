"use client";

import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const components = {
	h1: ({ children }: { children: React.ReactNode }) => (
		<Typography variant="h1" sx={{ fontSize: "4rem", fontWeight: 400 }}>
			{children}
		</Typography>
	),
	h2: ({ children }: { children: React.ReactNode }) => {
		const id = typeof children === "string" ? children.toLowerCase().replace(/\s+/g, "-") : "";
		return (
			<Typography
				variant="h2"
				id={id}
				sx={{
					fontSize: "2rem",
					fontWeight: 400,
					mt: "2rem",
					scrollMarginTop: "2rem", // Add space when scrolling to heading
				}}
			>
				{children}
			</Typography>
		);
	},
	p: ({ children }: { children: React.ReactNode }) => (
		<Typography variant="body1" sx={{ fontSize: "1rem", fontWeight: 300, textWrap: "pretty", mb: "1rem" }}>
			{children}
		</Typography>
	),
	ul: ({ children }: { children: React.ReactNode }) => <List>{children}</List>,
	li: ({ children }: { children: React.ReactNode }) => (
		<ListItem>
			<ListItemText>{children}</ListItemText>
		</ListItem>
	),
	code: ({ className, children, ...properties }: { className?: string; children: React.ReactNode }) => {
		const match = /language-(\w+)/.exec(className || "");
		return match ? (
			<SyntaxHighlighter language={match[1]} PreTag="div" style={dark} {...properties}>
				{String(children)}
			</SyntaxHighlighter>
		) : (
			<code className={className} {...properties}>
				{children}
			</code>
		);
	},
};

export default function Article({ source }: { source: MDXRemoteSerializeResult<Record<string, unknown>, Record<string, unknown>> }) {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", "& pre": { width: "100%" } }}>
			<MDXRemote {...source} components={components} />
		</Box>
	);
}
