"use client";

import { useMDXComponents } from "@/mdx-components";
import { Box } from "@mui/material";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import React from "react";

export default function Article({ source }: { source: MDXRemoteSerializeResult }) {
	const components = useMDXComponents({});

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				maxWidth: "800px",
				"& pre": {
					width: "100%",
					margin: "1.5rem 0"
				},
				"& img": {
					maxWidth: "100%",
					height: "auto",
					borderRadius: "0.5rem",
					margin: "1.5rem 0"
				}
			}}
		>
			<MDXRemote {...source} components={components} />
		</Box>
	);
}
