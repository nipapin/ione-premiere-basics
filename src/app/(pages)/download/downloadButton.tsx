"use client";

import { Button } from "@mui/material";
import Link from "next/link";

export default function downloadButton({ href, title }: { href: string; title: string }) {
	const downloadFile = async () => {
		const response = await fetch(href);
		const blob = await response.blob();
		const url = window.URL.createObjectURL(new Blob([blob]));
		const a = document.createElement("a");
		a.href = url;
		a.download = "Odin Pro Installer.zip";
		a.click();
	};
	return (
		<Button onClick={downloadFile} variant='contained' fullWidth sx={{ borderRadius: "0.5rem" }}>
			{title}
		</Button>
	);
}
