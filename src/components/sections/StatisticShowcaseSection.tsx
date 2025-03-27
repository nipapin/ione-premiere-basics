import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Wrapper } from "../layout/Wrapper";

type StaticticItem = {
	id: number;
	title: string;
	label: string;
};

const staticticItems: StaticticItem[] = [
	{ id: 1, title: "$1.5B+", label: "active listing wordlide" },
	{
		id: 2,
		title: "100+",
		label: "cities and towns with active Premiere Basics"
	},
	{ id: 3, title: "75%", label: "assets Under Managment" }
];

export default function StatisticShowcase() {
	return (
		<>
			<Stack
				display={{ md: "flex", xs: "none" }}
				direction='row'
				divider={<Divider flexItem orientation='vertical' />}
				spacing={2}
				py={"2rem"}
			>
				{staticticItems.map((item) => {
					return (
						<Wrapper
							key={item.id}
							display={"flex"}
							flexDirection={"column"}
							gap={1}
							alignItems={"center"}
							px={"2rem"}
						>
							<Typography variant='h2' fontWeight={400}>
								{item.title}
							</Typography>
							<Typography textAlign={"center"} fontWeight={200}>
								{item.label}
							</Typography>
						</Wrapper>
					);
				})}
			</Stack>
			<Stack
				display={{ md: "none", xs: "flex" }}
				direction='column'
				divider={<Divider flexItem orientation='horizontal' />}
				spacing={2}
				py={"2rem"}
			>
				{staticticItems.map((item) => {
					return (
						<Wrapper
							key={item.id}
							display={"flex"}
							flexDirection={"column"}
							gap={1}
							alignItems={"center"}
							px={"2rem"}
						>
							<Typography variant='h2' fontWeight={400}>
								{item.title}
							</Typography>
							<Typography textAlign={"center"} fontWeight={200}>
								{item.label}
							</Typography>
						</Wrapper>
					);
				})}
			</Stack>
		</>
	);
}
