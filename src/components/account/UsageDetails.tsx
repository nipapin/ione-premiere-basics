"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import { Alert, Box, Button, Divider, LinearProgress, Skeleton, Typography } from "@mui/material";
import type { AccountAiUsage } from "@/entities/ai-usage";

const toolNames:Record<string,string>={captions:"Captions",chapters:"Chapters","caption-highlights":"AI Highlights"};
const dateFormat=new Intl.DateTimeFormat("en",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
const timeFormat=new Intl.DateTimeFormat("en",{hour:"2-digit",minute:"2-digit",hourCycle:"h23",timeZone:"UTC"});
const dateText=(value:string|null)=>value?dateFormat.format(new Date(value)):"—";

export default function UsageDetails({accountId,initial}:{accountId:string;initial:AccountAiUsage|null}){
  const router=useRouter();
  const [data,setData]=useState(initial);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(initial?null:"Usage is temporarily unavailable. Please try again.");
  const requestId=useRef(0);
  const controller=useRef<AbortController|null>(null);
  const page=useRef(initial?.usage.page??1);

  const refresh=useCallback(async(nextPage=1)=>{
    controller.current?.abort();
    const current=++requestId.current;
    const abort=new AbortController();controller.current=abort;
    setLoading(true);setError(null);
    try{
      const response=await fetch(`/api/account/usage?page=${nextPage}`,{
        credentials:"same-origin",cache:"no-store",signal:abort.signal,
      });
      if(requestId.current!==current)return;
      if(response.status===401){setData(null);router.replace("/login");router.refresh();return;}
      if(!response.ok)throw new Error("USAGE_UNAVAILABLE");
      const result:AccountAiUsage=await response.json();
      if(requestId.current!==current)return;
      if(result.accountId!==accountId){setData(null);router.refresh();return;}
      setData(result);page.current=result.usage.page;
    }catch{
      if(!abort.signal.aborted && requestId.current===current) {
        setError("Could not refresh usage. Please try again. Previously loaded values may be out of date.");
      }
    }finally{if(requestId.current===current)setLoading(false);}
  },[accountId,router]);

  useEffect(()=>{
    requestId.current++;controller.current?.abort();
    setData(initial);page.current=initial?.usage.page??1;setLoading(false);
    setError(initial?null:"Usage is temporarily unavailable. Please try again.");
    return()=>{requestId.current++;controller.current?.abort();};
  },[accountId,initial]);
  useEffect(()=>{
    const focus=()=>{if(!document.hidden)void refresh(page.current);};
    window.addEventListener("focus",focus);document.addEventListener("visibilitychange",focus);
    return()=>{window.removeEventListener("focus",focus);document.removeEventListener("visibilitychange",focus);};
  },[refresh]);

  const current=data?.accountId===accountId?data:null;
  const balance=current?.balance;
  const history=current?.usage;
  const resetsAt=balance?.resets_at??null;
  useEffect(()=>{
    if(!resetsAt)return;
    let timer:ReturnType<typeof setTimeout>;
    const schedule=()=>{
      const delay=Date.parse(resetsAt)-Date.now()+1000;
      timer=setTimeout(()=>{if(Date.parse(resetsAt)>Date.now())schedule();else void refresh(1);},
        Math.max(0,Math.min(delay,2_147_483_647)));
    };
    schedule();return()=>clearTimeout(timer);
  },[resetsAt,refresh]);

  const ratio=balance && balance.limit>0?Math.min(100,balance.used/balance.limit*100):0;
  return <Box data-ui="usage" aria-busy={loading} sx={{"& h1, & h2":{fontWeight:400},minWidth:0}}>
    <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:2}}>
      <Typography component="h1" sx={{fontSize:"1.2rem"}}>Usage</Typography>
      <Button size="small" variant="text" onClick={()=>void refresh(page.current)} disabled={loading}
        startIcon={<RefreshRounded fontSize="small"/>} sx={{minHeight:36,color:"text.primary"}}>
        {loading?"Refreshing…":"Refresh"}
      </Button>
    </Box>
    <Divider sx={{my:2}}/>
    {error?<Alert severity="warning" sx={{mb:3}} role="status">{error}</Alert>:null}

    <Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",sm:"minmax(0,1.3fr) minmax(0,1fr)"},gap:3,py:1}}>
      <Box>
        <Typography sx={{color:"text.secondary",fontSize:14,mb:1}}>Generations remaining</Typography>
        {balance?<Typography component="p" sx={{fontSize:36,lineHeight:1.2,fontWeight:400,fontVariantNumeric:"tabular-nums"}}>
          {balance.remaining.toLocaleString("en")}<Box component="span" sx={{fontSize:18,color:"text.secondary",ml:1}}>/ {balance.limit.toLocaleString("en")}</Box>
        </Typography>:<Skeleton variant="text" width={150} height={44} animation={false}/>}
        <Typography sx={{fontSize:14,color:"text.secondary",mt:1}}>
          {current?.plan==="blocked"?"AI access is currently unavailable.":current?.plan==="trial"?"Trial allowance · 5 generations per month":"Monthly allowance"}
        </Typography>
      </Box>
      <Box sx={{alignSelf:"center"}}>
        <Box sx={{display:"flex",justifyContent:"space-between",gap:2,mb:1}}>
          <Typography sx={{fontSize:14,color:"text.secondary"}}>Used this period</Typography>
          <Typography sx={{fontSize:14,fontVariantNumeric:"tabular-nums"}}>{balance?`${balance.used.toLocaleString("en")} of ${balance.limit.toLocaleString("en")}`:"—"}</Typography>
        </Box>
        <LinearProgress variant="determinate" value={ratio} aria-label="Generations used this period"
          sx={{height:6,borderRadius:1,backgroundColor:"rgba(255,255,255,.1)","& .MuiLinearProgress-bar":{backgroundColor:"var(--primary)"}}}/>
        <Typography sx={{fontSize:13,color:"text.secondary",mt:1.5}}>Renews {dateText(resetsAt)}{resetsAt?` at ${timeFormat.format(new Date(resetsAt))} UTC`:""}</Typography>
      </Box>
    </Box>
    <Typography sx={{fontSize:13,color:"text.secondary",mt:2}}>Unused generations do not carry over to the next period.</Typography>
    <Divider sx={{my:3}}/>

    <Box sx={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:2,mb:1}}>
      <Typography component="h2" sx={{fontSize:"1rem"}}>This period</Typography>
      {history?<Typography sx={{fontSize:13,color:"text.secondary"}}>{history.total.toLocaleString("en")} {history.total===1?"operation":"operations"}</Typography>:null}
    </Box>
    <Box role="table" aria-label="AI generation usage" sx={{minWidth:0}}>
      <Box role="row" sx={{display:{xs:"none",sm:"grid"},gridTemplateColumns:"minmax(0,1fr) 180px 100px",gap:2,py:1.5,color:"text.secondary"}}>
        <Typography component="div" role="columnheader" sx={{fontSize:13}}>Tool</Typography>
        <Typography component="div" role="columnheader" sx={{fontSize:13,textAlign:"right"}}>Date · UTC</Typography>
        <Typography component="div" role="columnheader" sx={{fontSize:13,textAlign:"right"}}>Generations</Typography>
      </Box>
      {!history?<Box sx={{py:3}}><Skeleton animation={false}/><Skeleton animation={false}/><Skeleton animation={false}/></Box>
        :history.items.length===0?<Box role="row" sx={{py:4,borderTop:"1px solid",borderColor:"divider"}}>
          <Typography role="cell" sx={{fontSize:14,color:"text.secondary"}}>No generations used in this period yet.</Typography>
        </Box>:history.items.map(item=><Box role="row" key={item.id} sx={{
          display:"grid",gridTemplateColumns:{xs:"minmax(0,1fr) auto",sm:"minmax(0,1fr) 180px 100px"},
          gap:{xs:"4px 16px",sm:2},alignItems:"center",py:2,borderTop:"1px solid",borderColor:"divider",
        }}>
          <Typography component="div" role="cell" sx={{fontSize:14,minWidth:0}}>{toolNames[item.tool]??"AI Tools"}</Typography>
          <Typography component="div" role="cell" sx={{fontSize:13,color:"text.secondary",textAlign:{xs:"left",sm:"right"},
            gridRow:{xs:2,sm:"auto"},fontVariantNumeric:"tabular-nums"}}>
            <Box component="time" dateTime={item.createdAt}>{dateText(item.createdAt)} · {timeFormat.format(new Date(item.createdAt))}</Box>
          </Typography>
          <Typography component="div" role="cell" sx={{fontSize:14,textAlign:"right",fontVariantNumeric:"tabular-nums",
            gridColumn:{xs:2,sm:"auto"},gridRow:{xs:"1 / 3",sm:"auto"},color:item.cost===0?"text.secondary":"text.primary"}}>
            {item.cost===0?"Included":item.cost.toLocaleString("en")}
          </Typography>
        </Box>)}
    </Box>
    {history && history.total>history.pageSize?<Box sx={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:2,pt:2,borderTop:"1px solid",borderColor:"divider"}}>
      <Typography sx={{fontSize:13,color:"text.secondary"}}>{(history.page-1)*history.pageSize+1}–{Math.min(history.page*history.pageSize,history.total)} of {history.total}</Typography>
      <Box sx={{display:"flex",gap:1}}>
        <Button size="small" disabled={loading||history.page<=1} onClick={()=>void refresh(history.page-1)} sx={{minHeight:40,color:"text.primary"}}>Previous</Button>
        <Button size="small" disabled={loading||history.page*history.pageSize>=history.total} onClick={()=>void refresh(history.page+1)} sx={{minHeight:40,color:"text.primary"}}>Next</Button>
      </Box>
    </Box>:null}
  </Box>;
}
