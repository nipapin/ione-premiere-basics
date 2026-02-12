"use client";

import { Button, CircularProgress, TextField, Typography } from "@mui/material";

import { updateName } from "@/actions/user";
import { useUser } from "@/contexts/UserWrapper";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ChangeNameForm() {
	const { user } = useUser();

	const [pending, setPending] = useState<boolean>(false);
	const router = useRouter();

	const changeName = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setPending(true);
		const formData = new FormData(event.target as HTMLFormElement);
		const name = formData.get("name") as string;
		const lastname = formData.get("lastname") as string;
		updateName(name, lastname).then(() => {
			router.refresh();
			setPending(false);
		});
	};

	return (
		<Box>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { lg: "1fr 1fr 200px", xs: "1fr" },
					gap: "1rem"
				}}
				component={"form"}
				onSubmit={changeName}
			>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
					<Typography>First Name</Typography>
					<TextField
						variant='outlined'
						fullWidth
						defaultValue={user?.name || ""}
						slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
						name='name'
					/>
				</Box>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
					<Typography>Last Name</Typography>
					<TextField
						variant='outlined'
						fullWidth
						defaultValue={user?.lastname || ""}
						slotProps={{ input: { sx: { borderRadius: "0.5rem" } } }}
						name='lastname'
					/>
				</Box>
				<Button variant='contained' sx={{ borderRadius: "0.5rem", height: "56px", mt: "auto" }} type={"submit"}>
					{pending ? <CircularProgress size={20} color='inherit' /> : "Apply"}
				</Button>
			</Box>
		</Box>
	);
}
