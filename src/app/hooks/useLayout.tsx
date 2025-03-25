import { useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function useLayout() {
	const theme = useTheme();
	return { isMobile: useMediaQuery(theme.breakpoints.down("md")), isTablet: useMediaQuery(theme.breakpoints.down("xl")) };
}
