"use client";
import { Dialog } from "@mui/material";
import { AddRounded, ArrowBackRounded, CloseRounded, SettingsOutlined } from "@mui/icons-material";
import NextLink from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { SalesReport, SalesSummary } from "@/types/sales-report";
import { earningsScopeLabels } from "@/lib/partner-earnings";
import { netSalesRevenue } from "@/lib/sales-revenue";
import AffiliateLinkForm, { CopyReferralLink, referralUrl } from "./AffiliateLinkForm";
import PartnerSettings from "./PartnerSettings";
import s from "./SalesDashboard.module.css";

const money = (value: number, currency: string) => new Intl.NumberFormat("en-US", {style: "currency", currency}).format(value);
const partnerRevenue = (summary: SalesSummary | undefined, currency: string) => money(summary?.earnings.find(row => row.currency === currency)?.earnings ?? 0, currency);
const revenue = (summary: SalesSummary | undefined, currency: string) => money(netSalesRevenue(summary, currency), currency);
function Pager({ page, count, onChange }: {page: number; count: number; onChange: (page: number) => void}) {
 if (count <= 1) return null;
 return <div className={s.pagination}><span className={s.muted}>{page} / {count}</span><button className={s.button} disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button><button className={s.button} disabled={page >= count} onClick={() => onChange(page + 1)}>Next</button></div>;
}
export default function SalesDashboard({partnerId}: {partnerId?: string}) {
 const [report, setReport] = useState<SalesReport | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true);
 const [period, setPeriod] = useState("all"), [currency, setCurrency] = useState("USD");
 const [from, setFrom] = useState(""), [to, setTo] = useState(""), [code, setCode] = useState("");
 const [page, setPage] = useState(1), [revision, setRevision] = useState(0);
 const [tab, setTab] = useState(partnerId ? "links" : "partners");
 const [search, setSearch] = useState(""), [linkPage, setLinkPage] = useState(1);
 const [modal, setModal] = useState<"" | "link" | "partner" | "links" | "access" | "earnings">("");
 const [partnerName, setPartnerName] = useState(""), [creating, setCreating] = useState(false), [formError, setFormError] = useState("");
 const needsDates = period === "custom" && (!from || !to);
 function refresh() {setRevision(v => v + 1); setModal(""); setCode(""); setPage(1);}
 function switchTab(value: string) {setTab(value); setCode(""); setPage(1); setSearch(""); setLinkPage(1);}
 useEffect(() => {
  if (needsDates) {setLoading(false); return;}
  const abort = new AbortController(), params = new URLSearchParams({period, page: String(page)});
  if (partnerId) params.set("partner", partnerId);
  if (code) params.set("link", code);
  if (period === "custom") {params.set("from", from); params.set("to", to);}
  setError(""); setLoading(true);
  fetch(`/api/affilates/report?${params}`, {cache: "no-store", signal: abort.signal}).then(async r => {
   const data = await r.json(); if (!r.ok) throw new Error(data.error || "Unable to load report"); if (!abort.signal.aborted) setReport(data);
  }).catch(e => {if (!abort.signal.aborted) setError(e.message);}).finally(() => {if (!abort.signal.aborted) setLoading(false);});
  return () => abort.abort();
 }, [partnerId, period, from, to, code, page, revision, needsDates]);
 async function createPartner(event: FormEvent) {
  event.preventDefault(); if (creating) return; setCreating(true); setFormError("");
  try {
   const {token} = await (await fetch("/api/csrf", {cache: "no-store"})).json();
   const r = await fetch("/api/affilates/partners", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({name: partnerName, csrfToken: token})});
   const result = await r.json(); if (!r.ok) throw new Error(result.error);
   setPartnerName(""); setTab("partners"); refresh();
  } catch (e) {setFormError(e instanceof Error ? e.message : "Unable to create partner");} finally {setCreating(false);}
 }
 const links = report?.links.filter(link => `${link.label} ${link.code}`.toLowerCase().includes(search.toLowerCase())) || [];
 const periodLabel = report?.period.from ? new Intl.DateTimeFormat("en-US", {month: "short", year: "numeric", timeZone: "UTC"}).format(new Date(report.period.from)) : "All time";
 const modalTitle = {link: "Create link", partner: "Create partner", links: "Manage links", access: "Account access", earnings: "Partner earnings", "": ""}[modal];
 return <div className={s.page}>
  <header className={s.header}>
   <div>{partnerId && <NextLink className={s.back} href="/account/affilates"><ArrowBackRounded />Partners</NextLink>}<h1 className={s.heading}>{report?.partner?.name || (partnerId ? "Partner" : "Sales & partners")}{code && <span className={s.muted}> / {code}</span>}</h1></div>
   <div className={s.actions}>
    {partnerId && report?.isAdmin && <button className={s.button} onClick={() => setModal("earnings")}>Earnings settings</button>}
    {report?.isAdmin && (partnerId ? <button className={`${s.button} ${s.icon}`} title="Account access" aria-label="Account access" onClick={() => setModal("access")}><SettingsOutlined /></button> : <button className={s.button} onClick={() => {setModal("partner"); setFormError("");}}><AddRounded />Partner</button>)}
    {report && report.canCreateLinks && <button className={`${s.button} ${s.primary}`} onClick={() => setModal("link")}><AddRounded />Create link</button>}
   </div>
  </header>
  <div className={s.toolbar}>
   {[["all","All time"],["month","Current month"],["last-month","Last month"],["custom","Custom range"]].map(([value,title]) => <button className={`${s.button} ${period === value ? s.active : ""}`} key={value} aria-pressed={period === value} onClick={() => {setPeriod(value); setPage(1);}}>{title}</button>)}
   {report && <select aria-label="Revenue currency" className={`${s.select} ${s.currency}`} value={currency} onChange={e => setCurrency(e.target.value)}>{[...new Set(["USD", currency, ...report.summary.balances.map(r => r.currency)])].map(value => <option key={value} value={value}>{value} · all payments</option>)}</select>}
  </div>
  {period === "custom" && <div className={s.row}><label className={s.field}>From<input className={s.input} type="date" value={from} onChange={e => {setFrom(e.target.value); setPage(1);}} /></label><label className={s.field}>To<input className={s.input} type="date" value={to} onChange={e => {setTo(e.target.value); setPage(1);}} /></label></div>}
  {error ? <div className={s.error} role="alert">{error} <button className={s.button} onClick={refresh}>Retry</button></div> : needsDates ? <div className={s.muted}>Choose a date range</div> : loading || !report ? <div className={s.loading} role="status">Loading…</div> : <>
   {report.summary.missingSettlements > 0 && <div className={s.error} role="status">Earnings are incomplete: {report.summary.missingSettlements} sale(s) have no PayPro net or settlement currency and are excluded from the calculation.</div>}
   <section className={s.stats} aria-label="Sales overview">
    {[
     {label:"Revenue", value:partnerId ? partnerRevenue(report.summary,currency) : revenue(report.summary,currency), note:periodLabel, title:partnerId ? "Partner earnings after PayPro fees, 7% atomX royalty and the 50% split" : "After refunds and PayPro fees", accent:true},
     {label:"Transactions", value:report.summary.transactions, note:periodLabel},
     {label:"Buyers", value:report.summary.buyers, note:"Unique buyers"},
     {label:"Active subscriptions", value:report.summary.activeSubscriptions, note:"Currently active"},
     {label:"Visits", value:report.summary.visits, note:"Tracked visits", title:"One visit per browser tab session and link. Includes an initial count based on buyers."},
    ].map(card => <div className={s.stat} key={card.label} title={card.title}><div className={s.statLabel}>{card.label}</div><div className={`${s.statValue} ${card.accent ? s.money : ""}`}>{card.value}</div><div className={s.statNote}>{card.note}</div></div>)}
   </section>
   <div className={s.tabs} role="tablist" aria-label="Reports">
    {(partnerId ? [["links","Links"],["payments","Payments"]] : [["partners","Partners"],["links","Links"],["payments","Payments"]]).map(([value,title]) => <button role="tab" aria-selected={tab === value} className={`${s.tab} ${tab === value ? s.active : ""}`} key={value} onClick={() => switchTab(value)}>{title}{value === "links" ? ` (${report.links.length})` : ""}</button>)}
   </div>
   {tab === "partners" && <section className={s.panel}>
    <div className={s.panelHeader}><h2>All partners</h2><span className={s.muted}>{report.partners.length} partners</span></div>
    <div className={s.scroll}><table className={s.table}><thead><tr><th>Partner</th><th>Sales counted</th><th>Links</th><th className={s.numeric}>Visits</th><th className={s.numeric}>Buyers</th><th className={s.numeric}>Transactions</th><th className={s.numeric}>Active</th><th className={s.numeric}>Partner earnings</th></tr></thead><tbody>
     {report.partners.map(p => <tr key={p.id}><td><NextLink className={s.name} href={`/account/affilates/${p.id}`}>{p.name}</NextLink></td><td>{earningsScopeLabels[p.earningsScope]}</td><td><span className={s.muted} title={p.links.map(l => l.label).join(", ")}>{p.links.slice(0,2).map(l => l.label).join(", ") || "—"}{p.links.length > 2 ? ` +${p.links.length - 2}` : ""}</span></td><td className={s.numeric}>{p.summary.visits}</td><td className={s.numeric}>{p.summary.buyers}</td><td className={s.numeric}>{p.summary.transactions}</td><td className={s.numeric}>{p.summary.activeSubscriptions}</td><td className={`${s.numeric} ${s.money}`}>{partnerRevenue(p.summary,currency)}{p.summary.missingSettlements > 0 && <div className={s.muted}>Incomplete</div>}</td></tr>)}
     {!report.partners.length && <tr><td className={s.empty} colSpan={8}>No partners yet</td></tr>}
    </tbody></table></div>
   </section>}
   {tab === "links" && <section className={s.panel}>
    <div className={s.panelHeader}><h2>Referral links</h2><div className={s.actions}><input className={`${s.input} ${s.search}`} aria-label="Search links" placeholder="Search links…" value={search} onChange={e => {setSearch(e.target.value); setLinkPage(1);}} />{partnerId && report.isAdmin && <button className={s.button} onClick={() => setModal("links")}>Manage links</button>}</div></div>
    <div className={s.scroll}><table className={s.table}><thead><tr><th>Name</th><th>Referral link</th><th className={s.numeric} title="Includes an initial count based on buyers">Visits</th><th className={s.numeric}>Buyers</th><th className={s.numeric}>Transactions</th><th className={s.numeric}>Active</th><th className={s.numeric}>Revenue</th></tr></thead><tbody>
     {links.slice((linkPage-1)*10,linkPage*10).map(link => {const summary=report.linkSummaries[link.code]; return <tr key={link.code}><td><button className={s.name} style={{border:0, background:"none",font:"inherit",fontWeight:600,textAlign:"left"}} onClick={() => {setCode(link.code); setTab("payments"); setPage(1);}}>{link.label}</button></td><td><div className={s.urlRow}><a className={s.url} href={referralUrl(link.code)} title={referralUrl(link.code)} target="_blank" rel="noopener noreferrer">{referralUrl(link.code)}</a><CopyReferralLink code={link.code}/></div></td><td className={s.numeric}>{summary?.visits || 0}</td><td className={s.numeric}>{summary?.buyers || 0}</td><td className={s.numeric}>{summary?.transactions || 0}</td><td className={s.numeric}>{summary?.activeSubscriptions || 0}</td><td className={`${s.numeric} ${s.money}`}>{partnerId ? partnerRevenue(summary,currency) : revenue(summary,currency)}</td></tr>;})}
     {!links.length && <tr><td className={s.empty} colSpan={7}>{search ? "No matching links" : "No links yet"}</td></tr>}
    </tbody></table></div>
    <Pager page={linkPage} count={Math.ceil(links.length/10)} onChange={setLinkPage}/>
   </section>}
   {tab === "payments" && <section className={s.panel}>
    <div className={s.panelHeader}><h2>{code ? report.links.find(l=>l.code===code)?.label || code : "All payments"} <span className={s.muted}>· {report.totalRows}</span></h2><div className={s.actions}><select className={s.select} aria-label="Payment source" value={code} onChange={e=>{setCode(e.target.value);setPage(1);}}><option value="">All eligible sales</option>{report.links.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}</select></div></div>
    <div className={s.scroll}><table className={s.table}><thead><tr><th>Buyer / order</th><th>Plan</th><th>Source</th><th className={s.numeric}>Before fees</th><th className={s.numeric}>PayPro fee</th><th className={s.numeric}>PayPro net</th>{partnerId && <><th className={s.numeric}>atomX · 7%</th><th className={s.numeric}>Partner · 50%</th></>}<th>Date (UTC)</th></tr></thead><tbody>
     {report.payments.map(p=><tr key={p.id}><td><div>{p.buyer}</div><div className={s.muted}>#{p.orderId}</div></td><td>{p.plan}</td><td><span className={s.badge}>{p.source || "Direct"}</span></td><td className={`${s.numeric} ${s.money}`} title={`Gross ${money(p.gross,p.currency)}`}>{money(p.revenue,p.currency)}{p.refunds>0 && <div className={s.muted}>Refund {money(p.refunds,p.currency)}</div>}</td><td className={s.numeric}>{p.fee!==null && p.balanceCurrency ? money(p.fee,p.balanceCurrency) : "—"}</td><td className={s.numeric}>{p.net!==null && p.balanceCurrency ? money(p.net,p.balanceCurrency) : "—"}</td>{partnerId && <><td className={s.numeric}>{p.settlement && p.balanceCurrency ? money(p.settlement.royalty,p.balanceCurrency) : "—"}</td><td className={`${s.numeric} ${s.money}`}>{p.settlement && p.balanceCurrency ? money(p.settlement.earnings,p.balanceCurrency) : "—"}</td></>}<td style={{whiteSpace:"nowrap"}}>{new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeZone:"UTC"}).format(new Date(p.date))}</td></tr>)}
     {!report.payments.length && <tr><td className={s.empty} colSpan={partnerId ? 9 : 7}>No payments in this period</td></tr>}
    </tbody></table></div>
    <Pager page={page} count={Math.ceil(report.totalRows/report.pageSize)} onChange={setPage}/>
   </section>}
  </>}
  <Dialog open={!!modal} onClose={()=>{if (!creating) setModal("");}} aria-labelledby="sales-dialog-title" maxWidth="sm" slotProps={{paper:{sx:{background:"#11151b",border:"1px solid #303744",borderRadius:"12px",m:2,backgroundImage:"none"}}}}>
   <div className={s.modal}><div className={s.panelHeader}><h2 id="sales-dialog-title">{modalTitle}</h2><button className={`${s.button} ${s.icon}`} aria-label="Close" disabled={creating} onClick={()=>setModal("")}><CloseRounded/></button></div>
    {modal==="link" && <AffiliateLinkForm isAdmin={report?.isAdmin || false} partnerId={partnerId} partners={report?.partners} onCreated={()=>{setTab("links");setLinkPage(1);setSearch("");refresh();}} />}
    {modal==="partner" && <form className={s.form} onSubmit={createPartner}><label className={s.field}>Name<input className={s.input} autoFocus required maxLength={80} value={partnerName} onChange={e=>setPartnerName(e.target.value)} disabled={creating}/></label>{formError && <div className={s.error} role="alert">{formError}</div>}<div className={s.footer}><button className={`${s.button} ${s.primary}`} disabled={creating} type="submit">{creating?"Creating…":"Create partner"}</button></div></form>}
    {(modal==="links" || modal==="access" || modal==="earnings") && partnerId && report && <PartnerSettings partnerId={partnerId} currentCodes={report.links.map(l=>l.code)} currentScope={report.partner?.earningsScope} mode={modal} onSaved={refresh}/>}
   </div>
  </Dialog>
 </div>;
}
