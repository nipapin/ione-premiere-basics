"use client";

import { Button, CircularProgress } from "@mui/material";
import { useState } from "react";

export default function downloadButton({ href, title }: { href: string; title: string }) {
	const [loading, setLoading] = useState(false);
	const downloadFile = async () => {
		setLoading(true);
		const response = await fetch(href);
		const blob = await response.blob();
		const url = window.URL.createObjectURL(new Blob([blob]));
		const a = document.createElement("a");
		a.href = url;
		a.download = "Odin Pro Installer.zip";
		a.click();
		setLoading(false);
		a.remove();
	};
	return (
		<Button onClick={downloadFile} variant='contained' fullWidth sx={{ borderRadius: "0.5rem" }}>
			{loading ? <CircularProgress size={16} sx={{ color: "background.paper" }} /> : title}
		</Button>
	);
}
