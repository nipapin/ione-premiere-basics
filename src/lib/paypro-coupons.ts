import "server-only";
import type { PromoInput } from "@/entities/promo-codes";

export class CouponProviderError extends Error {
 constructor(public code: string, public uncertain = false) {super(code);}
}

export async function createPayproCoupon(input: PromoInput) {
 const vendorAccountId = Number(process.env.PAYPRO_VENDOR_ACCOUNT_ID);
 const apiSecretKey = process.env.PAYPRO_API_SECRET_KEY?.trim();
 if (!Number.isSafeInteger(vendorAccountId) || vendorAccountId <= 0 || !apiSecretKey) throw new CouponProviderError("PAYPRO_NOT_CONFIGURED");
 try {
  const response = await fetch("https://store.payproglobal.com/api/Products/CreatePercentageDiscountCoupon", {
   method:"POST", redirect:"error", cache:"no-store", signal:AbortSignal.timeout(15000),
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({vendorAccountId, apiSecretKey, couponName:input.name, percentageValue:input.percentage, couponCodes:[input.code], productIds:input.productIds,
    ...(input.validFrom ? {validFrom:input.validFrom} : {}), ...(input.validTill ? {validTill:input.validTill} : {})}),
  });
  if ([401,403].includes(response.status)) throw new CouponProviderError("PAYPRO_DENIED");
  const data = await response.json().catch(() => null);
  if (response.status >= 500 || !data) throw new CouponProviderError("PAYPRO_UNKNOWN", true);
  if (data.isSuccess === false) throw new CouponProviderError("PAYPRO_REJECTED");
  if (!response.ok || data.isSuccess !== true || !Number.isSafeInteger(data.response?.couponId) || data.response.couponId <= 0) throw new CouponProviderError("PAYPRO_UNKNOWN", true);
  // PayPro echoes credentials in `request`. Return only the confirmed coupon ID.
  return String(data.response.couponId);
 } catch(error) {
  if (error instanceof CouponProviderError) throw error;
  throw new CouponProviderError("PAYPRO_UNKNOWN", true);
 }
}
