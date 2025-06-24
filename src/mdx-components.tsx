"use client";

import type { MDXComponents } from "mdx/types";
import { Box, Divider, Link, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Highlight, themes } from "prism-react-renderer";

const StyledPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(2),
	margin: theme.spacing(2, 0),
	background: "var(--background-gradient)",
	borderRadius: "1rem",
	border: "1px solid #ffffff20"
}));

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		...components,
		h1: ({ children }: { children: React.ReactNode }) => (
			<Typography
				variant='h1'
				sx={{
					fontSize: { xl: "3rem", md: "2.5rem", sm: "2rem", xs: "1.5rem" },
					fontWeight: 400,
					mb: "2rem",
					textWrap: "balance"
				}}
			>
				{children}
			</Typography>
		),
		h2: ({ children }: { children: React.ReactNode }) => {
			const id = typeof children === "string" ? children.toLowerCase().replace(/\s+/g, "-") : "";
			return (
				<Typography
					variant='h2'
					id={id}
					sx={{
						fontSize: { xl: "2rem", md: "1.5rem", sm: "1.5rem", xs: "1.5rem" },
						fontWeight: 400,
						mt: "3rem",
						mb: "1.5rem",
						scrollMarginTop: "2rem",
						position: "relative",
						"&::after": {
							content: '""',
							position: "absolute",
							bottom: "-0.5rem",
							left: 0,
							width: "3rem",
							height: "2px",
							background: "var(--primary)",
							opacity: 0.5
						}
					}}
				>
					{children}
				</Typography>
			);
		},
		h3: ({ children }: { children: React.ReactNode }) => (
			<Typography
				variant='h3'
				sx={{
					fontSize: { xl: "2rem", md: "1.75rem", sm: "1.5rem", xs: "1.25rem" },
					fontWeight: 400,
					mt: "2rem",
					mb: "1rem"
				}}
			>
				{children}
			</Typography>
		),
		p: ({ children }: { children: React.ReactNode }) => (
			<Typography
				variant='body1'
				sx={{
					fontSize: { xl: "1.1rem", md: "1rem", sm: "0.95rem", xs: "0.9rem" },
					fontWeight: 200,
					textWrap: "pretty",
					mb: "1.5rem",
					lineHeight: 1.7
				}}
			>
				{children}
			</Typography>
		),
		ul: ({ children }: { children: React.ReactNode }) => <List sx={{ mb: "1.5rem", pl: "1.5rem" }}>{children}</List>,
		ol: ({ children }: { children: React.ReactNode }) => (
			<List sx={{ mb: "1.5rem", pl: "1.5rem", listStyleType: "decimal" }}>{children}</List>
		),
		li: ({ children }: { children: React.ReactNode }) => (
			<ListItem sx={{ display: "list-item", pl: 0, mb: "0.5rem" }}>
				<ListItemText
					primary={children}
					sx={{
						"& .MuiListItemText-primary": {
							fontSize: { xl: "1.1rem", md: "1rem", sm: "0.95rem", xs: "0.9rem" },
							fontWeight: 200,
							lineHeight: 1.7
						}
					}}
				/>
			</ListItem>
		),
		a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
			<Link
				href={href}
				sx={{
					color: "var(--primary)",
					textDecoration: "none",
					"&:hover": {
						textDecoration: "underline"
					}
				}}
			>
				{children}
			</Link>
		),
		blockquote: ({ children }: { children: React.ReactNode }) => (
			<StyledPaper sx={{ borderLeft: "4px solid var(--primary)" }}>
				<Typography
					component='blockquote'
					sx={{
						fontSize: "1.1rem",
						fontWeight: 200,
						fontStyle: "italic",
						lineHeight: 1.7
					}}
				>
					{children}
				</Typography>
			</StyledPaper>
		),
		hr: () => <Divider sx={{ my: "2rem" }} />,
		code: ({ className, children, ...properties }: { className?: string; children: React.ReactNode }) => {
			const match = /language-(\w+)/.exec(className || "");
			return match ? (
				<Box sx={{ mb: "1.5rem", borderRadius: "0.5rem", overflow: "hidden" }}>
					<Highlight
						theme={themes.dracula}
						code={String(children)}
						language={match[1]}
					>
						{({ className, style, tokens, getLineProps, getTokenProps }) => (
							<pre
								className={className}
								style={{
									...style,
									margin: 0,
									borderRadius: "0.5rem",
									fontSize: "0.95rem",
									padding: "1rem"
								}}
							>
								{tokens.map((line, i) => (
									<div key={i} {...getLineProps({ line })}>
										{line.map((token, key) => (
											<span key={key} {...getTokenProps({ token })} />
										))}
									</div>
								))}
							</pre>
						)}
					</Highlight>
				</Box>
			) : (
				<code
					className={className}
					style={{
						background: "rgba(255, 255, 255, 0.1)",
						padding: "0.2rem 0.4rem",
						borderRadius: "0.25rem",
						fontSize: "0.9em",
						fontFamily: "monospace"
					}}
					{...properties}
				>
					{children}
				</code>
			);
		}
	};
}
