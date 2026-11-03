import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export function verifyPayproSignature(fields: Record<string, string>) {
 const key = process.env.PAYPRO_VALIDATION_KEY;
 const signature = fields.SIGNATURE;
 if (!key || !signature || !/^[a-f0-9]{64}$/i.test(signature)) throw new Error("Invalid PayPro sales signature");
 const expected = createHash("sha256").update([fields.ORDER_ID, fields.ORDER_STATUS, fields.ORDER_TOTAL_AMOUNT, fields.CUSTOMER_EMAIL, key, fields.TEST_MODE, fields.IPN_TYPE_NAME].join("")).digest();
 if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) throw new Error("Invalid PayPro sales signature");
}
