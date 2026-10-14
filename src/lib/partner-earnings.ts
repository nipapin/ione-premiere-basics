export type EarningsScope = "links" | "links_and_direct" | "all";
export const earningsScopeLabels: Record<EarningsScope, string> = {
 links: "Personal links only", links_and_direct: "Personal links + direct sales", all: "All sales",
};
export function isEarningsScope(value: unknown): value is EarningsScope {
 return typeof value === "string" && Object.hasOwn(earningsScopeLabels, value);
}
/** Round each sale to cents; refunds reverse the same royalty and partner share. */
export function partnerSettlement(net: number) {
 const round = (value: number) => Math.sign(value) * Math.round(Math.abs(value));
 const cents = round(net * 100);
 const royalty = round(cents * 7 / 100);
 const remaining = cents - royalty;
 return { royalty: royalty / 100, afterRoyalty: remaining / 100, earnings: round(remaining / 2) / 100 };
}
