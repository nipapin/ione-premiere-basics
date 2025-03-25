"use client";

import { styled } from "@mui/material/styles";
import Link, { LinkProps } from "next/link";

interface StyledLinkProps extends LinkProps {
	children?: React.ReactNode;
	active?: boolean;
}

const StyledLinkBase = styled(Link)(({ theme }) => ({
	color: theme.palette.text.primary,
	textDecoration: "none",
	"&:hover": {
		opacity: 0.8
	}
}));

export default function StyledLink({ children, ...props }: StyledLinkProps) {
	const { active, as, ...linkProps } = props;
	return (
		<StyledLinkBase
			{...linkProps}
			as={as as React.ElementType}
			sx={{ color: active ? "var(--primary)" : "inherit" }}
		>
			{children}
		</StyledLinkBase>
	);
}
