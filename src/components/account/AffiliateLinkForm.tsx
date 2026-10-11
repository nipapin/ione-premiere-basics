"use client";

import { Alert, Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";

export function referralUrl(code: string) {
	return `https://odin-pro.com/?ref=${encodeURIComponent(code)}`;
}

export function CopyReferralLink({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);
	const [failed, setFailed] = useState(false);
	async function copy() {
		try {
			await navigator.clipboard.writeText(referralUrl(code));
			setCopied(true);
			setFailed(false);
		} catch { setFailed(true); }
	}
	return <Button size="small" onClick={copy} aria-label={`Copy referral link ${code}`}>{failed ? "Select URL to copy" : copied ? "Copied" : "Copy link"}</Button>;
}

export default function AffiliateLinkForm({ isAdmin, onCreated }: { isAdmin: boolean; onCreated: () => void }) {
	const [code, setCode] = useState("");
	const [label, setLabel] = useState("");
	const [ownerEmail, setOwnerEmail] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [created, setCreated] = useState<string | null>(null);
	const normalizedCode = code.trim().toLowerCase();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (pending) return;
		setPending(true);
		setError(null);
		setCreated(null);
		try {
			const csrf = await fetch("/api/csrf", { cache: "no-store" });
			if (!csrf.ok) throw new Error("Unable to create the link. Please try again.");
			const { token } = await csrf.json();
			const response = await fetch("/api/affilates", {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: normalizedCode, label, ...(isAdmin ? { ownerEmail } : {}), csrfToken: token }),
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || "Unable to create the link. Please try again.");
			setCreated(result.code);
			setCode("");
			setLabel("");
			onCreated();
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Unable to create the link. Please try again.");
		} finally { setPending(false); }
	}

	return (
		<Box component="form" onSubmit={submit} sx={{ mb: 3 }}>
			<Typography variant="h2" sx={{ fontSize: "1.2rem", fontWeight: 500, mb: 2 }}>Create a referral link</Typography>
			<Stack spacing={2}>
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
					<TextField label="Link name" value={label} onChange={event => setLabel(event.target.value)} disabled={pending} fullWidth slotProps={{ htmlInput: { maxLength: 80 } }} helperText="Optional, e.g. YouTube October" />
					<TextField label="Referral code" value={code} onChange={event => setCode(event.target.value)} disabled={pending} required fullWidth slotProps={{ htmlInput: { minLength: 3, maxLength: 64, pattern: "[A-Za-z0-9](?:[A-Za-z0-9]|-){1,62}[A-Za-z0-9]" } }} helperText="3–64 letters, numbers or hyphens" />
				</Stack>
				{isAdmin && <TextField label="Owner account email" type="email" value={ownerEmail} onChange={event => setOwnerEmail(event.target.value)} disabled={pending} fullWidth slotProps={{ htmlInput: { maxLength: 254 } }} helperText="Leave empty to create for your account. The owner must already have an account." />}
				{normalizedCode && <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{referralUrl(normalizedCode)}</Typography>}
				{error && <Alert severity="error">{error}</Alert>}
				{created && <Alert severity="success">
					Link created. Share it to track sales:
					<Stack direction="row" useFlexGap flexWrap="wrap" alignItems="center" gap={1}>
						<Link href={referralUrl(created)} target="_blank" rel="noopener noreferrer" sx={{ overflowWrap: "anywhere" }}>{referralUrl(created)}</Link>
						<CopyReferralLink code={created} />
					</Stack>
				</Alert>}
				<Button type="submit" variant="contained" disabled={pending} sx={{ alignSelf: "flex-start" }}>{pending ? "Creating…" : "Create link"}</Button>
			</Stack>
		</Box>
	);
}
