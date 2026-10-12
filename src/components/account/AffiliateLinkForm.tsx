"use client";
import { ContentCopyRounded, CheckRounded } from "@mui/icons-material";
import { useState, type FormEvent } from "react";
import s from "./SalesDashboard.module.css";

export function referralUrl(code: string) { return `https://odin-pro.com/?ref=${encodeURIComponent(code)}`; }
export function CopyReferralLink({ code }: { code: string }) {
 const [copied, setCopied] = useState(false), [failed, setFailed] = useState(false);
 async function copy() {
  try { await navigator.clipboard.writeText(referralUrl(code)); setCopied(true); setFailed(false); setTimeout(() => setCopied(false), 1800); }
  catch { setFailed(true); }
 }
 return <button type="button" className={`${s.button} ${s.icon}`} onClick={copy} aria-label={`Copy referral link ${code}`} title={failed ? "Select the URL to copy" : copied ? "Copied" : "Copy link"}>{copied ? <CheckRounded /> : <ContentCopyRounded />}</button>;
}
export default function AffiliateLinkForm({ isAdmin, onCreated, partnerId, partners = [] }: { isAdmin: boolean; onCreated: () => void; partnerId?: string; partners?: {id: string; name: string}[] }) {
 const [code, setCode] = useState(""), [label, setLabel] = useState(""), [ownerEmail, setOwnerEmail] = useState("");
 const [selectedPartner, setSelectedPartner] = useState(partnerId || "");
 const [pending, setPending] = useState(false), [error, setError] = useState("");
 async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); if (pending) return; setPending(true); setError("");
  try {
   const csrf = await fetch("/api/csrf", { cache: "no-store" });
   if (!csrf.ok) throw new Error("Please sign in again");
   const { token } = await csrf.json();
   const response = await fetch("/api/affilates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code.trim().toLowerCase(), label, ...(isAdmin && !selectedPartner && !partners.length ? {ownerEmail} : {}), ...(selectedPartner ? {partnerId: selectedPartner} : {}), csrfToken: token }) });
   const result = await response.json(); if (!response.ok) throw new Error(result.error);
   setCode(""); setLabel(""); onCreated();
  } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create link"); }
  finally { setPending(false); }
 }
 return <form onSubmit={submit} className={s.form}>
  {!partnerId && partners.length > 0 && <label className={s.field}>Partner<select className={s.select} value={selectedPartner} onChange={e => setSelectedPartner(e.target.value)} disabled={pending}><option value="">My link</option>{partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
  <label className={s.field}>Name<input className={s.input} placeholder="YouTube October" maxLength={80} value={label} onChange={e => setLabel(e.target.value)} disabled={pending} /></label>
  <label className={s.field}>Referral code<input className={s.input} placeholder="youtube-october" minLength={3} maxLength={64} pattern="[A-Za-z0-9](?:[A-Za-z0-9]|-){1,62}[A-Za-z0-9]" required value={code} onChange={e => setCode(e.target.value)} disabled={pending} /><span className={s.muted}>odin-pro.com/?ref={code.trim().toLowerCase() || "your-code"}</span></label>
  {isAdmin && !partnerId && !partners.length && <label className={s.field}>Account email<input className={s.input} type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} disabled={pending} /></label>}
  {error && <div className={s.error} role="alert">{error}</div>}
  <div className={s.footer}><button className={`${s.button} ${s.primary}`} disabled={pending} type="submit">{pending ? "Creating…" : "Create link"}</button></div>
 </form>;
}
