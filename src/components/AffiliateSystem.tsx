"use client";

import { setCookies } from "@/actions/setCookies";
import { useEffect } from "react";

export default function AffiliateSystem({ affiliate }: { affiliate: string }) {
	useEffect(() => {
		if (!affiliate) return;
		setCookies("odin-pro-affiliate", affiliate);
	}, [affiliate]);

	return <></>;
}
