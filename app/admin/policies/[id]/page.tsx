import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PolicyForm from "../PolicyForm";

export const dynamic = "force-dynamic";

export default async function EditPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("policies")
    .select("id, title, content, level, parent_id, display_order, is_active")
    .eq("id", id)
    .single();
  if (!data) notFound();

  let parents: { id: string; title: string; level: number }[] = [];
  if (data.level > 1) {
    const { data: ps } = await supabase
      .from("policies")
      .select("id, title, level")
      .eq("level", data.level - 1)
      .eq("is_archived", false)
      .order("display_order");
    parents = ps ?? [];
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold">공약 편집 (level {data.level})</h1>
      <PolicyForm
        level={data.level}
        parents={parents}
        initial={{ ...data, content: data.content ?? "" }}
      />
    </div>
  );
}
