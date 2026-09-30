const CODE = /^[A-F0-9]{8}$/;

/** Only the homepage CEP confirmation dialog is a supported authentication return target. */
export function cepReturnPath(value?: string): string | undefined {
  if (!value || !value.startsWith("/")) return undefined;
  try {
    const url = new URL(value, "https://odin-pro.com");
    if (url.origin !== "https://odin-pro.com") return undefined;
    const code = (url.pathname === "/" ? url.searchParams.get("cep") : url.pathname === "/cep/login" ? url.searchParams.get("code") : null)?.toUpperCase();
    if (!code || !CODE.test(code)) return undefined;
    return `/?${new URLSearchParams({ cep: code })}`;
  } catch { return undefined; }
}
