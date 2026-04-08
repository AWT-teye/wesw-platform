import { getOrCreatePrimaryCandidate } from "@/lib/candidate";
import SnsForm from "./SnsForm";
import type { SnsLinks } from "../actions";

export const dynamic = "force-dynamic";

export default async function SnsEditPage() {
  const c = await getOrCreatePrimaryCandidate();
  const initial: SnsLinks = (c.sns_links ?? {}) as SnsLinks;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold">SNS 링크 관리</h1>
      <SnsForm initial={initial} />
    </div>
  );
}
