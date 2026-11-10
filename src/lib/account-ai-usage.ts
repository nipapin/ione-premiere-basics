import "server-only";
import { cepAuth } from "@/lib/cep-service";
import type { AccountAiUsage } from "@/entities/ai-usage";

/** Caller supplies only an ID taken from a validated website session. */
export async function accountAiUsage(userId: string, page=1): Promise<AccountAiUsage> {
  if(!Number.isInteger(page) || page<1 || page>10000)throw new Error("INVALID_PAGE");
  const profile=await cepAuth.profile({id:"website-usage",user_id:userId});
  if(!profile)throw new Error("ACCOUNT_NOT_FOUND");
  const secret=process.env.MOTIONFLOW_MANAGEMENT_SECRET;
  if(!secret || secret.length<32)throw new Error("AI_NOT_CONFIGURED");
  const base=new URL(process.env.MOTIONFLOW_AI_ORIGIN || process.env.MOTIONFLOW_CATALOG_ORIGIN || "https://motionflow.pro");
  if(base.username || base.password || (base.protocol!=="https:" && !(base.protocol==="http:" &&
    ["localhost","127.0.0.1"].includes(base.hostname))))throw new Error("AI_NOT_CONFIGURED");
  const response=await fetch(new URL("/api/integrations/odin/ai",base),{
    method:"POST",cache:"no-store",redirect:"error",signal:AbortSignal.timeout(15000),
    headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/json"},
    body:JSON.stringify({action:"usage",page,profile:{user:profile.user,subscription:profile.subscription,
      entitlements:{ai:profile.entitlements.ai}}}),
  });
  if(!response.ok)throw new Error("AI_UNAVAILABLE");
  const data=await response.json();
  const count=(value:unknown)=>typeof value==="number" && Number.isSafeInteger(value) && value>=0;
  const timestamp=(value:unknown)=>typeof value==="string" && Number.isFinite(Date.parse(value));
  if(!data?.balance || ![data.balance.used,data.balance.limit,data.balance.remaining].every(count) ||
    !(data.balance.resets_at===null || timestamp(data.balance.resets_at)) ||
    !Array.isArray(data.usage?.items) || data.usage.items.length>20 || !count(data.usage.total) ||
    data.usage.page!==page || data.usage.pageSize!==20 ||
    !data.usage.items.every((item:AccountAiUsage["usage"]["items"][number])=>
      item && typeof item.id==="string" && typeof item.tool==="string" && count(item.cost) && timestamp(item.createdAt))) {
    throw new Error("INVALID_AI_RESPONSE");
  }
  return {accountId:profile.user.id,plan:profile.entitlements.ai.plan as AccountAiUsage["plan"],
    periodStart:profile.entitlements.ai.period_start,
    balance:{used:data.balance.used,limit:data.balance.limit,remaining:data.balance.remaining,resets_at:data.balance.resets_at},
    usage:{items:data.usage.items.map((item:AccountAiUsage["usage"]["items"][number])=>({
      id:item.id,tool:item.tool,cost:item.cost,createdAt:item.createdAt,
    })),total:data.usage.total,page:data.usage.page,pageSize:data.usage.pageSize}};
}
