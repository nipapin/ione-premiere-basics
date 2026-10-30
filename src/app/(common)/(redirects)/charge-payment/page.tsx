import { cookies } from "next/headers";
import RedirectLoader from "./components/RedirectLoader";
import { randomUUID } from "node:crypto";
import { pool } from "@/app/database/pool";
import { validateSession } from "@/lib/session";
import { readReferralAttribution } from "@/lib/referral-attribution";
import { saveReferralAttribution } from "@/lib/cinecom";

interface ChargePaymentPageProps {
	searchParams: Promise<{ after: string }>;
}

export default async function ChargePaymentPage({ searchParams }: ChargePaymentPageProps) {
	const { after } = await searchParams;
	const productID = Buffer.from(after, "base64").toString("utf-8");
	const session = await validateSession();
	let affiliate = "";
	let attributionId = "";
	if (session) {
		const db = await pool.connect();
		try {
			await db.query("BEGIN");
			await db.query("SELECT user_id FROM users WHERE user_id=$1 FOR UPDATE", [session.user_id]);
			const attribution = await saveReferralAttribution(db, session.user_id, readReferralAttribution(await cookies()));
			if (attribution) {
				affiliate = attribution.referral;
				attributionId = randomUUID();
				await db.query("INSERT INTO odin_referral_checkouts(id,user_id,referral,cid) VALUES($1,$2,$3,$4)", [attributionId, session.user_id, affiliate, attribution.cid]);
			}
			await db.query("COMMIT");
		} catch (error) {
			await db.query("ROLLBACK");
			throw error;
		} finally { db.release(); }
	}

	return <RedirectLoader productID={productID} affilate={affiliate} attributionId={attributionId} />;
}
