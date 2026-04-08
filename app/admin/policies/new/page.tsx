import { createClient } from "@/lib/supabase/server";
import PolicyForm from "../PolicyForm";

export const dynamic = "force-dynamic";

export default async function NewPolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const sp = await searchParams;
  const level = Number(sp.level ?? "1");

  // 상위 레벨 공약 목록 (parent 선택용)
  let parents: { id: string; title: string; level: number }[] = [];
  if (level > 1) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("policies")
      .select("id, title, level")
      .eq("level", level - 1)
      .eq("is_archived", false)
      .order("display_order");
    parents = data ?? [];
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold">새 공약 (level {level})</h1>
      <PolicyForm level={level} parents={parents} />
    </div>
  );
}
