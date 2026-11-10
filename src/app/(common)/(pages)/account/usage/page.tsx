import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { validateSession } from "@/lib/session";
import { accountAiUsage } from "@/lib/account-ai-usage";
import UsageDetails from "@/components/account/UsageDetails";

export const metadata:Metadata={title:"Odin Pro | Usage",robots:{index:false,follow:false}};

export default async function UsagePage(){
  const session=await validateSession();
  if(!session)redirect("/login");
  const initial=await accountAiUsage(session.user_id).catch(()=>null);
  return <UsageDetails accountId={session.user_id} initial={initial}/>;
}
