import { Button } from "@mui/material";

export default function DownloadButton({ href, title }: { href: string; title: string }) {
	return (
		<Button
			href={href}
			download={"Odin Pro Installer.zip"}
			variant='contained'
			fullWidth
			sx={{ borderRadius: "0.5rem" }}
		>
			{title}
		</Button>
	);
}
