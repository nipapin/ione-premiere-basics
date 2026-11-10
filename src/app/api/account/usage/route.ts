import { validateSession } from "@/lib/session";
import { accountAiUsage } from "@/lib/account-ai-usage";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});

export async function GET(request:Request){
  const session=await validateSession();
  if(!session)return json({error:"UNAUTHORIZED"},401);
  const value=new URL(request.url).searchParams.get("page");
  const page=value===null?1:Number(value);
  if(!Number.isInteger(page)||page<1||page>10000)return json({error:"INVALID_PAGE"},400);
  try{return json(await accountAiUsage(session.user_id,page));}
  catch{return json({error:"USAGE_UNAVAILABLE"},503);}
}
