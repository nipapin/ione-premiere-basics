import { query } from "@/app/database/postgre";
import { validateSession } from "@/lib/session";
import { validateCsrfToken } from "@/lib/csrf";
import { createPromoCode, parsePromoInput, PromoError } from "@/lib/promo-codes";

const headers={"Cache-Control":"private, no-store"};
async function admin() {
 const session=await validateSession();
 if (!session) throw new PromoError(401,"Please sign in.");
 const [user]=await query("SELECT user_id,email,is_admin FROM users WHERE user_id=$1",[session.user_id]);
 if (user?.is_admin !== true) throw new PromoError(403,"Administrator access required.");
 return user;
}
function failure(error:unknown) {
 return Response.json({error:error instanceof PromoError?error.message:"Unable to access promo codes. Refresh the list before retrying creation."},{status:error instanceof PromoError?error.status:503,headers});
}
export async function GET(request:Request) {
 try {
  await admin();
  const page=Number(new URL(request.url).searchParams.get("page")||1);
  if (!Number.isSafeInteger(page)||page<1||page>100000) throw new PromoError(400,"Invalid page.");
  const [codes,[total]]=await Promise.all([
   query("SELECT * FROM odin_promo_codes ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET $1",[(page-1)*25]),
   query("SELECT count(*)::int AS count FROM odin_promo_codes"),
  ]);
  return Response.json({codes,page,pageSize:25,total:total.count},{headers});
 } catch(error) {return failure(error);}
}
export async function POST(request:Request) {
 try {
  const user=await admin();
  const body=await request.json().catch(()=>null);
  if (!body || typeof body.csrfToken!=="string" || !await validateCsrfToken(body.csrfToken)) throw new PromoError(403,"Your security token expired. Try again.");
  const input=parsePromoInput(body);
  const code=await createPromoCode(query,user,input);
  return Response.json({code},{status:code.provider_status==="created"?200:code.provider_status==="failed"?422:202,headers});
 } catch(error) {return failure(error);}
}
