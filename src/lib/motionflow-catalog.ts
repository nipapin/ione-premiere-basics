export const usesMotionflowCatalog = () => process.env.MOTIONFLOW_CATALOG_ENABLED === "true";

export async function motionflowCatalogRequest(path: "catalog" | "download", packId?: number, request = fetch) {
  const origin = process.env.MOTIONFLOW_CATALOG_ORIGIN;
  const secret = process.env.MOTIONFLOW_CATALOG_SECRET;
  if (!origin || !secret || secret.length < 32) throw new Error("Motionflow catalog not configured");
  const base = new URL(origin);
  // Same-host integration can use loopback; remote origins must use TLS.
  if (base.username || base.password || (base.protocol !== "https:" && !(base.protocol === "http:" && ["localhost", "127.0.0.1"].includes(base.hostname)))) throw new Error("Invalid catalog origin");
  const url = new URL(`/api/integrations/odin/${path}`, base);
  if (packId !== undefined) url.searchParams.set("pack_id", String(packId));
  const response = await request(url, { headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Motionflow catalog unavailable");
  return response.json();
}

export function validateMotionflowDownload(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid download URL");
  const url = new URL(value);
  const hosts = (process.env.MOTIONFLOW_DOWNLOAD_HOSTS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (url.protocol !== "https:" || url.username || url.password || url.port || !hosts.includes(url.hostname)) throw new Error("Unexpected download host");
  return url.toString();
}
