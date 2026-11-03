"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Dialog } from "@mui/material";
import { AddRounded, CloseRounded, ContentCopyRounded } from "@mui/icons-material";
import { promoProducts, promoErrorMessages, type PromoCode, type PromoInput } from "@/entities/promo-codes";
import s from "./SalesDashboard.module.css";

type Report={codes:PromoCode[];page:number;pageSize:number;total:number};
const date=(value:string|null)=>value?new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"}).format(new Date(value)):"—";
function status(code:PromoCode) {
 if (code.provider_status === "unknown" || code.provider_status === "creating" && Date.now()-Date.parse(code.updated_at)>120000) return "Check in PayPro";
 if (code.provider_status === "creating") return "Creating…";
 if (code.provider_status === "failed") return "Not created";
 if (code.valid_till && Date.parse(code.valid_till)<=Date.now()) return "Expired";
 if (code.valid_from && Date.parse(code.valid_from)>Date.now()) return "Scheduled";
 return "Active";
}
export default function PromoCodes() {
 const [report,setReport]=useState<Report|null>(null),[page,setPage]=useState(1),[revision,setRevision]=useState(0);
 const [error,setError]=useState(""),[loading,setLoading]=useState(true),[open,setOpen]=useState(false),[pending,setPending]=useState(false),[formError,setFormError]=useState(""),[notice,setNotice]=useState("");
 const [name,setName]=useState(""),[code,setCode]=useState(""),[percentage,setPercentage]=useState("20"),[products,setProducts]=useState(promoProducts.map(p=>p.id)),[from,setFrom]=useState(""),[till,setTill]=useState("");
 const request=useRef<{payload:string;id:string}|null>(null);
 useEffect(()=>{
  const abort=new AbortController();setLoading(true);setError("");
  fetch(`/api/promo-codes?page=${page}`,{cache:"no-store",signal:abort.signal}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error||"Unable to load promo codes");setReport(data);}).catch(e=>{if(!abort.signal.aborted)setError(e.message);}).finally(()=>{if(!abort.signal.aborted)setLoading(false);});
  return ()=>abort.abort();
 },[page,revision]);
 function refresh(){setRevision(v=>v+1);}
 async function send(input:PromoInput) {
  const csrf=await fetch("/api/csrf",{cache:"no-store"});const {token}=await csrf.json();
  if(!csrf.ok||!token)throw new Error("Unable to verify your session. Refresh and try again.");
  const response=await fetch("/api/promo-codes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...input,csrfToken:token})});
  const data=await response.json();
  if(!data.code)throw new Error(data.error||"Unable to create the promo code. Refresh the list before retrying.");
  const result=data.code as PromoCode;
  if(result.provider_status!=="created")throw new Error(promoErrorMessages[result.error_code||""]||"Coupon creation is still pending. Refresh the list before trying again.");
  setNotice(`${result.code} created in PayPro.`);setOpen(false);request.current=null;setCode("");setName("");setFrom("");setTill("");setPage(1);
 }
 async function create(event:FormEvent) {
  event.preventDefault();if(pending)return;setPending(true);setFormError("");setNotice("");
  try{
   const payload={name:name.trim(),code:code.trim().toUpperCase(),percentage:Number(percentage),productIds:products,validFrom:from?new Date(from+"Z").toISOString():null,validTill:till?new Date(till+"Z").toISOString():null};
   const key=JSON.stringify(payload);
   if(!request.current||request.current.payload!==key)request.current={payload:key,id:crypto.randomUUID()};
   await send({...payload,requestId:request.current.id});
  }catch(e){setFormError(e instanceof Error?e.message:"Unable to create the code. Refresh the list before retrying.");}finally{setPending(false);refresh();}
 }
 async function retry(item:PromoCode) {
  if(pending)return;setPending(true);setError("");setNotice("");
  try{await send({requestId:item.id,name:item.name,code:item.code,percentage:item.percentage,productIds:item.product_ids,validFrom:item.valid_from,validTill:item.valid_till});}
  catch(e){setError(e instanceof Error?e.message:"Unable to retry creation.");}finally{setPending(false);refresh();}
 }
 async function copy(value:string){try{await navigator.clipboard.writeText(value);setNotice(`${value} copied.`);}catch{setError("Unable to copy. Select and copy the code from the table.");}}
 return <div className={s.page}>
  <header className={s.header}><h1 className={s.heading}>Promo codes</h1><button className={`${s.button} ${s.primary}`} disabled={pending} onClick={()=>{setFormError("");setOpen(true);}}><AddRounded/>Create promo code</button></header>
  <p className={s.muted} style={{margin:0}}>Create percentage discounts for the PayPro checkout. All administrators can view these codes. Recurring discounts and usage limits are managed in PayPro.</p>
  {notice&&<div role="status" style={{color:"var(--primary)"}}>{notice}</div>}
  {error&&<div className={s.error} role="alert">{error}</div>}
  <section className={s.panel} aria-label="Promo codes">
   <div className={s.panelHeader}><h2>Created on this site {report&&<span className={s.muted}>· {report.total}</span>}</h2><button className={s.button} disabled={loading||pending} onClick={refresh}>Refresh</button></div>
   {loading?<div className={s.loading} role="status">Loading…</div>:<div className={s.scroll}><table className={s.table}>
    <thead><tr><th>Code / campaign</th><th>Discount</th><th>Products</th><th>Status</th><th>Validity (UTC)</th><th>Created by</th><th>PayPro ID</th><th/></tr></thead>
    <tbody>{report?.codes.map(item=><tr key={item.id}>
     <td><div className={s.urlRow}><strong>{item.code}</strong>{item.provider_status==="created"&&<button className={`${s.button} ${s.icon}`} aria-label={`Copy ${item.code}`} onClick={()=>copy(item.code)}><ContentCopyRounded/></button>}</div><div className={s.muted}>{item.name}</div></td>
     <td className={s.money}>{item.percentage}%</td><td>{item.product_ids.map(id=>promoProducts.find(p=>p.id===id)?.label||id).join(", ")}</td>
     <td><span className={s.badge}>{status(item)}</span>{item.error_code&&<div className={s.muted} style={{maxWidth:230,marginTop:6}}>{promoErrorMessages[item.error_code]||"Check the code in PayPro."}</div>}</td>
     <td style={{whiteSpace:"nowrap"}}><div>From: {item.valid_from?date(item.valid_from):"Immediately"}</div><div>Until: {item.valid_till?date(item.valid_till):"No expiry"}</div></td>
     <td><div>{item.created_by_email}</div><div className={s.muted}>{date(item.created_at)}</div></td><td>{item.provider_coupon_id||"—"}</td>
     <td>{item.provider_status==="failed"&&<button className={s.button} disabled={pending} onClick={()=>retry(item)}>Retry creation</button>}</td>
    </tr>)}{!report?.codes.length&&<tr><td className={s.empty} colSpan={8}>No promo codes created here yet</td></tr>}</tbody>
   </table></div>}
   {report&&report.total>report.pageSize&&<div className={s.pagination}><span className={s.muted}>{page} / {Math.ceil(report.total/report.pageSize)}</span><button className={s.button} disabled={page<=1||loading} onClick={()=>setPage(p=>p-1)}>Previous</button><button className={s.button} disabled={page*report.pageSize>=report.total||loading} onClick={()=>setPage(p=>p+1)}>Next</button></div>}
  </section>
  <Dialog open={open} onClose={()=>{if(!pending)setOpen(false);}} maxWidth="sm" aria-labelledby="promo-dialog-title" slotProps={{paper:{sx:{background:"#11151b",border:"1px solid #303744",borderRadius:"12px",m:2,backgroundImage:"none"}}}}>
   <div className={s.modal}><div className={s.panelHeader}><h2 id="promo-dialog-title">Create promo code</h2><button className={`${s.button} ${s.icon}`} aria-label="Close" disabled={pending} onClick={()=>setOpen(false)}><CloseRounded/></button></div>
    <form className={s.form} onSubmit={create}>
     <label className={s.field}>Campaign name<input className={s.input} required maxLength={80} value={name} onChange={e=>setName(e.target.value)} disabled={pending} placeholder="Winter offer"/></label>
     <div className={s.row}><label className={s.field} style={{flex:1}}>Promo code<input className={s.input} required minLength={3} maxLength={32} pattern="[A-Za-z0-9]{3,32}" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} disabled={pending} placeholder="ODIN20"/></label><label className={s.field} style={{width:100}}>Discount (%)<input className={s.input} type="number" required min={1} max={99} step={1} value={percentage} onChange={e=>setPercentage(e.target.value)} disabled={pending}/></label></div>
     <fieldset style={{margin:0,padding:0,border:0}} disabled={pending}><legend style={{fontSize:12,marginBottom:8}}>Products</legend><div className={s.row} style={{flexWrap:"wrap"}}>{promoProducts.map(p=><label className={s.chip} key={p.id}><input type="checkbox" checked={products.includes(p.id)} onChange={e=>setProducts(values=>e.target.checked?[...values,p.id]:values.filter(id=>id!==p.id))}/>{p.label}</label>)}</div></fieldset>
     <label className={s.field}>Start (UTC, optional)<input className={s.input} type="datetime-local" value={from} onChange={e=>setFrom(e.target.value)} disabled={pending}/></label>
     <label className={s.field}>Expiry (UTC, optional)<input className={s.input} type="datetime-local" value={till} onChange={e=>setTill(e.target.value)} disabled={pending}/></label>
     <p className={s.muted} style={{margin:0}}>Discounts from 1–99%. This creates a real coupon in PayPro for the selected products.</p>
     {formError&&<div className={s.error} role="alert">{formError}</div>}
     <div className={s.footer}><button className={`${s.button} ${s.primary}`} disabled={pending||!products.length} type="submit">{pending?"Creating in PayPro…":"Create in PayPro"}</button></div>
    </form>
   </div>
  </Dialog>
 </div>;
}
