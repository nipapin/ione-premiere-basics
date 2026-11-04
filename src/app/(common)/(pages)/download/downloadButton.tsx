import { Button } from "@mui/material";

export default function DownloadButton({ href, title, filename = "Odin Pro Installer.zip" }: { href: string; title: string; filename?: string }) {
	return (
		<Button
			href={href}
			download={filename}
			variant='contained'
			fullWidth
			sx={{ borderRadius: "0.5rem" }}
		>
			{title}
		</Button>
	);
}
