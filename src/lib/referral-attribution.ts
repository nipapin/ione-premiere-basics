export const referralCookie = "odin-pro-attribution";

export type ReferralAttribution = { ref: string; cid: string | null; attributedAt: string };

export function referralFromLink(params: URLSearchParams): ReferralAttribution | null {
  const ref = params.get("ref");
  if (!ref || !/^[a-z0-9_-]{1,200}$/i.test(ref)) return null;
  const cid = params.get("cid");
  if (cid && (cid.length > 512 || /[\u0000-\u001f\u007f]/.test(cid))) return null;
  const attribution = { ref, cid: cid || null, attributedAt: new Date().toISOString() };
  return encodeURIComponent(JSON.stringify(attribution)).length <= 3500 ? attribution : null;
}

export function readReferralAttribution(store: { get(name: string): { value: string } | undefined }): ReferralAttribution | null {
  try {
    const value = store.get(referralCookie)?.value;
    if (value) {
      const data = JSON.parse(decodeURIComponent(value));
      if (typeof data.ref !== "string" || !/^[a-z0-9_-]{1,200}$/i.test(data.ref) ||
          (data.cid !== null && (typeof data.cid !== "string" || data.cid.length > 512 || /[\u0000-\u001f\u007f]/.test(data.cid))) ||
          typeof data.attributedAt !== "string" || !Number.isFinite(Date.parse(data.attributedAt))) return null;
      const captured = new Date(data.attributedAt);
      const expires = new Date(captured);
      expires.setUTCMonth(expires.getUTCMonth() + 6);
      if (captured.getTime() > Date.now() + 60000 || expires.getTime() <= Date.now()) return null;
      return data;
    }
    // Preserve referrals from cookies issued before cid support was added.
    const ref = store.get("odin-pro-affiliate")?.value;
    return ref && /^[a-z0-9_-]{1,200}$/i.test(ref) ? { ref, cid: null, attributedAt: new Date().toISOString() } : null;
  } catch { return null; }
}
