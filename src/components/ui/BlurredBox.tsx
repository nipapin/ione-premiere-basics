import Box from "@mui/material/Box";

const BlurredBox = () => {
	return (
		<Box
			sx={{
				left: "10%",
				top: 0,
				filter: "blur(100px)",
				backgroundColor: "var(--blob)",
				opacity: 0.5,
				width: "300px",
				aspectRatio: 1,
				position: "absolute",
				zIndex: -1,
				transform: "translateY(-50%)"
			}}
		/>
	);
};

export default BlurredBox;
