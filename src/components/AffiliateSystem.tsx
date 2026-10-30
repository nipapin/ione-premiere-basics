"use client";

import { useEffect } from "react";

export default function AffiliateSystem({ affiliate }: { affiliate: string }) {
	useEffect(() => {
		if (!affiliate) return;
		try {
			const key = `odin-ref-visit:${affiliate}`;
			const visitId = sessionStorage.getItem(key) || crypto.randomUUID();
			sessionStorage.setItem(key, visitId);
			void fetch("/api/affilates/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: affiliate, visitId }), keepalive: true }).catch(() => {});
		} catch { /* Cookie attribution still works when browser storage is unavailable. */ }
	}, [affiliate]);

	return <></>;
}
