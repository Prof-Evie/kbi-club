import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";
import { LangProvider } from "@/components/lang";
import KbiApp from "@/components/kbi-app";

export default async function Page() {
  const store = await cookies();
  const actor = verifyToken(store.get(SESSION_COOKIE)?.value);

  return (
    <LangProvider>
      <KbiApp initialActor={actor} />
    </LangProvider>
  );
}
