"use client";

import useLayout from "@/app/hooks/useLayout";
import Box, { BoxProps } from "@mui/material/Box";

interface WrapperProps extends BoxProps {
	fullWidth?: boolean;
	variant?: "default" | "outlined" | "animated";
	angleOffset?: number;
}

export const Wrapper = ({
	children,
	fullWidth,
	variant,
	angleOffset,

	...props
}: WrapperProps) => {
	const { isMobile } = useLayout();
	const type = variant || "default";
	switch (type) {
		case "outlined":
			return (
				<Box border={"1px solid var(--primary)"} {...props}>
					{children}
				</Box>
			);
		case "animated":
			return (
				<Box
					margin='0 auto'
					width={fullWidth || isMobile ? "100%" : "auto"}
					{...props}
					sx={{ ...props.sx, "--offset": `${angleOffset || 0}deg` }}
				>
					<Box className='animated-outline'>
						<Box className='animated-outline-content'>{children}</Box>
					</Box>
				</Box>
			);
		default:
			return (
				<Box
					margin='0 auto'
					width={fullWidth || isMobile ? "100%" : "auto"}
					{...props}
				>
					{children}
				</Box>
			);
	}
};
