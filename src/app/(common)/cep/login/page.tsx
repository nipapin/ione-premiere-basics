import { redirect } from "next/navigation";
import { validateSession } from "@/lib/session";
import { cepReturnPath } from "@/lib/cep-return";
import { CepLogin } from "@/components/forms/CepLogin";

export default async function CepLoginPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const target = cepReturnPath(`/cep/login?code=${encodeURIComponent(code || "")}`);
  if (!target) return <main style={{ padding: "6rem 2rem" }}>Invalid sign-in code. Restart sign-in in Odin Pro.</main>;
  const session = await validateSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(target)}`);
  return <CepLogin code={code!.toUpperCase()} />;
}
