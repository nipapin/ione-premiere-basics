import "server-only";
import { promoProducts, type PromoInput, type PromoCode } from "@/entities/promo-codes";
import { createPayproCoupon, CouponProviderError } from "@/lib/paypro-coupons";

type Query = (sql:string, params?:unknown[]) => Promise<any[]>;
export class PromoError extends Error {
 constructor(public status:number, message:string) {super(message);}
}
export function parsePromoInput(body: unknown, now = Date.now()): PromoInput {
 if (!body || typeof body !== "object" || Array.isArray(body)) throw new PromoError(400,"Invalid promo code details.");
 const value = body as Record<string,unknown>;
 if (typeof value.requestId !== "string" || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value.requestId)) throw new PromoError(400,"Invalid creation request.");
 if (typeof value.name !== "string" || !value.name.trim() || value.name.trim().length > 80) throw new PromoError(400,"Enter a name up to 80 characters.");
 if (typeof value.code !== "string" || !/^[A-Za-z0-9]{3,32}$/.test(value.code.trim())) throw new PromoError(400,"Use 3–32 letters or numbers for the code.");
 if (!Number.isInteger(value.percentage) || Number(value.percentage) < 1 || Number(value.percentage) > 99) throw new PromoError(400,"Enter a whole-number discount from 1 to 99%.");
 if (!Array.isArray(value.productIds) || !value.productIds.length || value.productIds.length > 3 || value.productIds.some(id => !promoProducts.some(p => p.id === id))) throw new PromoError(400,"Choose at least one supported product.");
 const date = (field:unknown) => {
  if (field === null || field === undefined || field === "") return null;
  if (typeof field !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/.test(field) || !Number.isFinite(Date.parse(field))) throw new PromoError(400,"Enter valid dates in UTC.");
  const iso = new Date(field).toISOString();
  if (iso.slice(0,10) !== field.slice(0,10)) throw new PromoError(400,"Enter valid calendar dates.");
  return iso;
 };
 const validFrom=date(value.validFrom), validTill=date(value.validTill);
 if (validTill && Date.parse(validTill) <= now) throw new PromoError(400,"Expiration must be in the future.");
 if (validFrom && validTill && validFrom >= validTill) throw new PromoError(400,"Expiration must follow the start date.");
 return {requestId:value.requestId.toLowerCase(), name:value.name.trim(), code:value.code.trim().toUpperCase(), percentage:Number(value.percentage), productIds:[...new Set(value.productIds as number[])].sort((a,b)=>a-b), validFrom, validTill};
}
const iso = (value:string|Date|null) => value ? new Date(value).toISOString() : null;
function sameInput(row:PromoCode, input:PromoInput) {
 return row.code === input.code && row.name === input.name && row.percentage === input.percentage && JSON.stringify(row.product_ids) === JSON.stringify(input.productIds) && iso(row.valid_from) === input.validFrom && iso(row.valid_till) === input.validTill;
}

export async function createPromoCode(query:Query, actor:{user_id:string;email:string}, input:PromoInput, provider = createPayproCoupon) {
 const values=[input.requestId,input.code,input.name,input.percentage,input.productIds,input.validFrom,input.validTill,actor.user_id,actor.email];
 const inserted = await query(`INSERT INTO odin_promo_codes(id,code,name,percentage,product_ids,valid_from,valid_till,created_by,created_by_email,provider_status)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'creating') ON CONFLICT DO NOTHING RETURNING *`,values);
 if (!inserted.length) {
  const [existing] = await query("SELECT * FROM odin_promo_codes WHERE id=$1",[input.requestId]);
  if (!existing || !sameInput(existing,input)) throw new PromoError(409,"This code or request is already in use. Refresh the list before creating another code.");
  if (existing.provider_status === "created") return existing;
  if (existing.provider_status === "creating" && Date.now()-new Date(existing.updated_at).getTime() > 120000) {
   await query("UPDATE odin_promo_codes SET provider_status='unknown',error_code='PAYPRO_UNKNOWN',updated_at=NOW() WHERE id=$1 AND provider_status='creating'",[input.requestId]);
   throw new PromoError(409,"PayPro confirmation is unknown. Check the code in PayPro before continuing.");
  }
  if (existing.provider_status !== "failed") throw new PromoError(409,"This request is in progress or needs verification in PayPro. It will not be submitted twice.");
  const claimed=await query("UPDATE odin_promo_codes SET provider_status='creating',error_code=NULL,updated_at=NOW() WHERE id=$1 AND provider_status='failed' RETURNING id",[input.requestId]);
  if (!claimed.length) throw new PromoError(409,"This creation request is already in progress.");
 }
 let couponId:string;
 try {couponId=await provider(input);}
 catch(error) {
  const known=error instanceof CouponProviderError;
  const uncertain=!known || error.uncertain;
  const code=known ? error.code : "PAYPRO_UNKNOWN";
  await query("UPDATE odin_promo_codes SET provider_status=$2,error_code=$3,updated_at=NOW() WHERE id=$1 AND provider_status='creating'",[input.requestId,uncertain?"unknown":"failed",code]);
  return (await query("SELECT * FROM odin_promo_codes WHERE id=$1",[input.requestId]))[0];
 }
 try {
  return (await query("UPDATE odin_promo_codes SET provider_status='created',provider_coupon_id=$2,error_code=NULL,updated_at=NOW() WHERE id=$1 RETURNING *",[input.requestId,couponId]))[0];
 } catch {
  await query("UPDATE odin_promo_codes SET provider_status='unknown',error_code='PAYPRO_UNKNOWN',updated_at=NOW() WHERE id=$1 AND provider_status='creating'",[input.requestId]).catch(()=>{});
  throw new PromoError(503,"PayPro may have created this code. Refresh the list and check PayPro before trying another code.");
 }
}
