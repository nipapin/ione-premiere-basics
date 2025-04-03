"use client";

import { useMDXComponents } from "@/mdx-components";
import { Box, BoxProps } from "@mui/material";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import React from "react";

interface ArticleProps extends BoxProps {
	source: MDXRemoteSerializeResult;
}

export default function Article({ source, sx }: ArticleProps) {
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
				},
				...sx
			}}
		>
			<MDXRemote {...source} components={components} />
		</Box>
	);
}
