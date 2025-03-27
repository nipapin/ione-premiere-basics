"use client";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Wrapper } from "../layout/Wrapper";
import { Stack } from "@mui/material";
import Image from "next/image";

type ToggleItem = {
	id: number;
	label: string;
	media: string;
};

const toggleItems: ToggleItem[] = [
	{
		id: 1,
		label: "Scale your business and sales model",
		media: "/images/cover-poster.webp"
	},
	{
		id: 2,
		label: "Lorem ipsum dolor sit amet, consectetur adipiscing",
		media: "/images/cover-poster.webp"
	},
	{
		id: 3,
		label: "Scale your business with sales assembly",
		media: "/images/cover-poster.webp"
	}
];

export default function EditingSolutions() {
	const [active, setActive] = useState<number>(0);
	return (
		<Wrapper
			display={{ xl: "grid", xs: "none" }}
			gridTemplateColumns='420px 100px 1fr'
			alignContent={"center"}
			gap={2}
			maxWidth={"70vw"}
			py={"4rem"}
		>
			<Wrapper
				display={"flex"}
				flexDirection={"column"}
				gap={2}
				justifyContent={"center"}
			>
				<Typography variant='h2' fontWeight={400} whiteSpace={"pre"}>
					{`Editing solutions\ndriving growth\nand efficiency`}
				</Typography>
				<Typography fontWeight={200} whiteSpace={"pre"}>
					{`Our extension is a tool that outline your creative\nperformance and projections for you and your clients.`}
				</Typography>
				<Stack direction={"column"} spacing={2}>
					{toggleItems.map((item, index) => {
						return (
							<Button
								sx={{
									width: "fit-content",
									color: index === active ? "var(--primary)" : "currentColor",
									borderColor:
										index === active ? "var(--primary)" : "currentColor"
								}}
								key={item.id}
								variant='outlined'
								onClick={() => setActive(index)}
							>
								{item.label}
							</Button>
						);
					})}
				</Stack>
			</Wrapper>
			<div></div>
			<Wrapper
				variant='animated'
				sx={{ "& img": { width: "100%", height: "auto" } }}
			>
				<Image
					src={toggleItems[active].media}
					alt={toggleItems[active].label}
					width={1280}
					height={720}
				/>
			</Wrapper>
		</Wrapper>
	);
}
