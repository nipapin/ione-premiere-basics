type LegacyPack = {
  id: number; name: string; pack_name: string; author: string; version: string;
  primary_type: "AE" | "PR"; image_url: string; video_id?: string;
};

/** Existing Odin catalog used by the legacy CEP. No browser or CEP credentials are forwarded. */
export async function odinCatalog(subscribed: boolean, host?: string | null, request = fetch) {
  const url = new URL("https://api.get-atomx.com/atomx/v1/mau");
  url.searchParams.set("king", "Premiere Basics");
  url.searchParams.set("auth_password", "true");
  const response = await request(url, {
    headers: { "X-Requested-With": "Atom_X", "User-Agent": "AniomExtension_Atom" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Odin catalog unavailable");
  const data = await response.json();
  if (!Array.isArray(data?.market?.Packages)) throw new Error("Invalid Odin catalog");
  const packages = (data.market.Packages as LegacyPack[])
    .filter((pack) => pack.author === "Premiere Basics" && ["AE", "PR"].includes(pack.primary_type) && (!host || pack.primary_type === host))
    .map((pack) => ({
      id: pack.id, name: pack.name, pack_name: pack.pack_name || pack.name,
      author: pack.author, version: pack.version, primary_type: pack.primary_type,
      image_url: pack.image_url.replace(/^http:\/\//, "https://"), video_id: pack.video_id,
      owned: false, covered_by_subscription: subscribed, action: subscribed ? "install" : "buy",
      install_url: `/api/cep/market/download?pack_id=${encodeURIComponent(String(pack.id))}`,
      buy_url: "https://odin-pro.com/pricing", details_url: "https://odin-pro.com/features",
    }));
  return { subscription_active: subscribed, subscribe_url: "https://odin-pro.com/pricing", Packages: packages };
}

/** The legacy CEP uses this endpoint for full pack updates; access is gated by our subscription route. */
export async function odinPackUrl(host: "AE" | "PR", request = fetch): Promise<string> {
  const response = await request(`https://package.odin-pro.com/presigned/pack?host=${host === "AE" ? "AEFT" : "PPRO"}`, {
    signal: AbortSignal.timeout(15000), cache: "no-store",
  });
  if (!response.ok) throw new Error("Odin package server unavailable");
  const data = await response.json();
  if (!data.success || typeof data.url !== "string") throw new Error("Invalid Odin package response");
  return validateOdinDownloadUrl(data.url);
}

function validateOdinDownloadUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password ||
    url.hostname !== "odin-pro.4dd38e93681ae447cac2c65dca9aef09.r2.cloudflarestorage.com") {
    throw new Error("Unexpected Odin download host");
  }
  return url.toString();
}

/** Existing update_system/server POST /compare contract. Null requests a full archive fallback. */
export async function odinDiffUrl(host: "AE" | "PR", manifest: unknown, request = fetch): Promise<string | null> {
  const response = await request("https://package.odin-pro.com/compare", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manifest, appId: host === "AE" ? "AEFT" : "PPRO" }),
    signal: AbortSignal.timeout(120000), cache: "no-store",
  });
  if (!response.ok) throw new Error("Odin update server unavailable");
  const data = await response.json();
  if (!data.success) throw new Error("Invalid Odin update response");
  // With no changed files /compare omits both URL and manifest. Full download also
  // reconciles removed files, which cannot be inferred from that response alone.
  if (data.differentFilesCount === 0) return null;
  if (typeof data.url !== "string") throw new Error("Invalid Odin update response");
  return validateOdinDownloadUrl(data.url);
}
