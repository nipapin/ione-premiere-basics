/** Only the local CEP confirmation page is a supported authentication return target. */
export function cepReturnPath(value?: string): string | undefined {
  if (!value || !value.startsWith("/cep/login?")) return undefined;
  try {
    const url = new URL(value, "https://odin-pro.com");
    if (url.origin !== "https://odin-pro.com" || url.pathname !== "/cep/login") return undefined;
    const code = url.searchParams.get("code")?.toUpperCase();
    if (!code || !/^[A-F0-9]{8}$/.test(code)) return undefined;
    return `/cep/login?${new URLSearchParams({ code, client: "odin-cep" })}`;
  } catch { return undefined; }
}
