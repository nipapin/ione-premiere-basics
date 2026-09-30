"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

type Info = { status: string; device?: { user?: string; os?: string } };
const finished = (status?: string) => !!status && ["approved", "complete", "device_limit", "denied", "expired"].includes(status);

export function CepLogin({ code }: { code: string }) {
  const router = useRouter();
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
  function close() {
    const url = new URL(window.location.href);
    url.searchParams.delete("cep");
    router.replace(`${url.pathname}${url.search}`);
  }
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
  const canClose = finished(info?.status) || !!error;
  return <Dialog open onClose={canClose ? close : undefined} disableEscapeKeyDown={!canClose} slotProps={{ paper: { elevation: 1, sx: { borderRadius: "1rem", maxWidth: 480, width: "100%", m: 2 } } }}>
    <DialogTitle sx={{ width: "100%" }}>Sign in to Odin Pro</DialogTitle>
    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {!info && !error && <CircularProgress sx={{ alignSelf: "center", my: 2 }} />}
      {approved ? <Alert severity="success">Access approved. Return to the Odin Pro panel to finish signing in.</Alert> : null}
      {info?.status === "denied" && <Alert severity="info">Access denied. You can close this window.</Alert>}
      {info?.status === "expired" && <Alert severity="warning">This code has expired. Restart sign-in in the panel.</Alert>}
      {info?.status === "pending" && <>
        <Typography sx={{ width: "100%" }}>Odin Pro in Premiere Pro or After Effects is asking to use your account. Confirm that this code matches the one in your panel.</Typography>
        <Typography sx={{ width: "100%", fontFamily: "monospace", fontSize: "2rem", letterSpacing: "0.25em", textAlign: "center" }}>{code}</Typography>
        <Typography sx={{ width: "100%" }}>{[info.device?.user, info.device?.os].filter(Boolean).join(" · ")}</Typography>
      </>}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
      {info?.status === "pending" && <>
        <Button variant="contained" disabled={busy} onClick={() => void submit("approve")}>Allow access</Button>
        <Button variant="outlined" disabled={busy} onClick={() => void submit("deny")}>Deny</Button>
      </>}
      {canClose && <Button variant="outlined" onClick={close}>Close</Button>}
    </DialogActions>
  </Dialog>;
}
