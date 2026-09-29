"use client";
import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";

type Info = { status: string; device?: { user?: string; os?: string } };
export function CepLogin({ code }: { code: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cep/auth/confirm?code=${encodeURIComponent(code)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load sign-in request");
        if (!cancelled) setInfo(data);
      }).catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [code]);
  async function submit(action: "approve" | "deny") {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/cep/auth/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not confirm sign-in");
      setInfo((previous) => ({ ...previous, status: data.status }));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not confirm sign-in"); }
    finally { setBusy(false); }
  }
  const approved = info && ["approved", "complete", "device_limit"].includes(info.status);
  return <Box component="main" sx={{ maxWidth: 520, mx: "auto", my: "6rem", p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography variant="h1" fontSize="2rem">Sign in to Odin Pro</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    {!info && !error && <CircularProgress />}
    {approved ? <Alert severity="success">Access approved. Return to the Odin Pro panel to finish signing in.</Alert> : null}
    {info?.status === "denied" && <Alert severity="info">Access denied. You can close this page.</Alert>}
    {info?.status === "expired" && <Alert severity="warning">This code has expired. Restart sign-in in the panel.</Alert>}
    {info?.status === "pending" && <>
      <Typography>Odin Pro in Premiere Pro or After Effects is asking to use your account. Confirm that this code matches the one in your panel.</Typography>
      <Typography fontFamily="monospace" fontSize="2rem" letterSpacing="0.25em">{code}</Typography>
      <Typography>{[info.device?.user, info.device?.os].filter(Boolean).join(" · ")}</Typography>
      <Button variant="contained" disabled={busy} onClick={() => void submit("approve")}>Allow access</Button>
      <Button variant="outlined" disabled={busy} onClick={() => void submit("deny")}>Deny</Button>
    </>}
  </Box>;
}
