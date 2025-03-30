"use client";

import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		mode: "dark",
		primary: { main: "#ccff00" },
		background: {
			default: "#0e0f11",
			paper: "#0e0f11"
		}
	},
	typography: {
		fontFamily: "Clash Grotesk, sans-serif",
		fontWeightBold: 700,
		fontWeightMedium: 600,
		fontWeightRegular: 400,
		fontWeightLight: 300,
		allVariants: {
			lineHeight: 1
		}
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					fontSize: "1rem",
					fontWeight: 500,
					borderRadius: "999px",
					padding: "0.75rem 1.5rem",
					minWidth: 0,
					variants: [
						{
							props: { variant: "contained" },
							style: {
								backgroundColor: "var(--primary)",
								color: "var(--background)"
							}
						},
						{
							props: { variant: "outlined" },
							style: {
								borderColor: "white",
								color: "white",
								borderWidth: "2px",
								transition: "0.3s",
								"&:hover": {
									borderColor: "var(--primary)",
									backgroundColor: "var(--primary)",
									color: "var(--background)"
								}
							}
						}
					]
				}
			}
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					fontSize: 0
				}
			}
		},
		MuiTypography: {
			styleOverrides: {
				root: {
					width: "fit-content"
				}
			}
		}
	}
});

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
}
