"use client";

import { setCookies } from "@/actions/setCookies";
import { useEffect } from "react";

export default function AffiliateSystem({ affiliate, preserveAttribution = false }: { affiliate: string; preserveAttribution?: boolean }) {
	useEffect(() => {
		if (!affiliate) return;
		if (!preserveAttribution) setCookies("odin-pro-affiliate", affiliate);
		try {
			const key = `odin-ref-visit:${affiliate}`;
			const visitId = sessionStorage.getItem(key) || crypto.randomUUID();
			sessionStorage.setItem(key, visitId);
			void fetch("/api/affilates/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: affiliate, visitId }), keepalive: true }).catch(() => {});
		} catch { /* Cookie attribution still works when browser storage is unavailable. */ }
	}, [affiliate, preserveAttribution]);

	return <></>;
}
