export const promoProducts = [
 {id:111867, label:"Monthly"}, {id:113886, label:"Yearly"}, {id:113887, label:"Lifetime"},
];
export type PromoInput = {requestId:string; name:string; code:string; percentage:number; productIds:number[]; validFrom:string|null; validTill:string|null};
export type PromoCode = {id:string; name:string; code:string; percentage:number; product_ids:number[]; valid_from:string|null; valid_till:string|null; created_by_email:string; provider_status:"creating"|"created"|"failed"|"unknown"; provider_coupon_id:string|null; error_code:string|null; created_at:string; updated_at:string};
export const promoErrorMessages: Record<string,string> = {
 PAYPRO_NOT_CONFIGURED:"PayPro API credentials are not configured on the server.",
 PAYPRO_DENIED:"PayPro denied API access. Check the server IP allowlist and API credentials.",
 PAYPRO_REJECTED:"PayPro rejected the coupon. Check whether this code already exists in PayPro and whether its settings are supported.",
 PAYPRO_UNKNOWN:"PayPro may have created this code, but confirmation was lost. Check it in PayPro before creating another code. Automatic retry is disabled.",
};
