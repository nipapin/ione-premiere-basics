"use client";
import { CloseRounded } from "@mui/icons-material";
import { useEffect, useState, type FormEvent } from "react";
import { earningsScopeLabels, type EarningsScope } from "@/lib/partner-earnings";
import s from "./SalesDashboard.module.css";
export default function PartnerSettings({ partnerId, currentCodes, onSaved, currentScope = "links", mode = "links" }: { partnerId: string; currentCodes: string[]; onSaved: () => void; currentScope?: EarningsScope; mode?: "links" | "access" | "earnings" }) {
 const [scope, setScope] = useState<EarningsScope>(currentScope);
 const [options, setOptions] = useState<{affiliate: string; label: string}[]>([]);
 const [codes, setCodes] = useState(currentCodes), [search, setSearch] = useState(""), [email, setEmail] = useState("");
 const [error, setError] = useState(""), [pending, setPending] = useState(false);
 useEffect(() => {
  if (mode !== "links") return;
  const abort = new AbortController();
  fetch("/api/affilates", {signal: abort.signal, cache: "no-store"}).then(async r => { if (!r.ok) throw new Error("Unable to load links"); setOptions(await r.json()); }).catch(e => {if (!abort.signal.aborted) setError(e.message);});
  return () => abort.abort();
 }, [mode]);
 async function save(event: FormEvent) {
  event.preventDefault(); setPending(true); setError("");
  try {
   const {token} = await (await fetch("/api/csrf", {cache: "no-store"})).json();
   const response = await fetch(`/api/affilates/partners/${partnerId}`, {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({codes, ...(mode === "access" ? {ownerEmail: email} : mode === "earnings" ? {earningsScope: scope} : {}), csrfToken: token})});
   const result = await response.json(); if (!response.ok) throw new Error(result.error); onSaved();
  } catch (e) {setError(e instanceof Error ? e.message : "Unable to save");} finally {setPending(false);}
 }
 const available = options.filter(o => !codes.includes(o.affiliate) && `${o.label} ${o.affiliate}`.toLowerCase().includes(search.toLowerCase()));
 return <form className={s.form} onSubmit={save}>
  {mode === "earnings" ? <><label className={s.field}>Sales counted toward earnings<select className={s.select} style={{maxWidth:"100%"}} value={scope} disabled={pending} onChange={e => setScope(e.target.value as EarningsScope)}>{Object.entries(earningsScopeLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><p className={s.muted}>PayPro net − 7% atomX royalty → 50% to this partner. Refunds reverse earnings. Personal links are assigned in Manage links.</p></> : mode === "access" ? <label className={s.field}>Account email<input className={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="partner@example.com" disabled={pending} /><span className={s.muted}>Existing account. Empty removes access.</span></label> : <>
   <input aria-label="Search existing links" className={s.input} placeholder="Search links…" value={search} onChange={e => setSearch(e.target.value)} />
   <div className={s.results}>{available.length ? available.map(o => <button disabled={pending} key={o.affiliate} type="button" className={`${s.button} ${s.result}`} onClick={() => setCodes(v => [...v, o.affiliate])}><span>{o.label}<span className={s.muted}> · {o.affiliate}</span></span><span>+</span></button>) : <div className={s.muted}>No matching links</div>}</div>
   <div className={s.selected}>{codes.map(code => <span className={s.chip} key={code}>{options.find(o => o.affiliate === code)?.label || code}<button type="button" disabled={pending} aria-label={`Remove ${code}`} onClick={() => setCodes(v => v.filter(c => c !== code))}><CloseRounded /></button></span>)}</div>
  </>}
  {error && <div role="alert" className={s.error}>{error}</div>}
  <div className={s.footer}><button className={`${s.button} ${s.primary}`} disabled={pending} type="submit">{pending ? "Saving…" : "Save"}</button></div>
 </form>;
}
