"use client";
import { confirmAccount } from "@/actions/user";
import { cepReturnPath } from "@/lib/cep-return";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";

export default function RedirectMesssage({ token, next }: { token: string; next?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function confirm() {
    setBusy(true);
    try {
      if (!token || !await confirmAccount(token)) throw new Error("This confirmation link is invalid or has already been used.");
      window.location.replace(cepReturnPath(next) || "/account");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not confirm email"); setBusy(false); }
  }
  return <Box sx={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 2 }}>
    <Typography variant="h1" fontSize="2rem">Confirm your email</Typography>
    {error && <Typography color="error">{error}</Typography>}
    <Button variant="contained" disabled={busy} onClick={() => void confirm()}>Confirm and continue</Button>
  </Box>;
}
