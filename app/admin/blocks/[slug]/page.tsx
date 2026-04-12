import { createClient } from "@/lib/supabase/server";
import BlockForm from "../BlockForm";
import JsonBlockForm from "../JsonBlockForm";

export const dynamic = "force-dynamic";

const SLUG_LABELS: Record<string, string> = {
  we_camp_intro: "위기 대시보드 — 인트로 텍스트",
  we_crisis_stats: "위기 대시보드 — 데이터 카드 (JSON)",
  we_opportunity_cycle: "위기 대시보드 — 악순환 고리 (JSON)",
  we_camp_closing: "위기 대시보드 — 클로징 슬로건",
  we_slogan: "슬로건",
  we_footer_legal: "푸터 (선관위 의무표시)",
};

const JSON_SLUGS = ["we_crisis_stats", "we_opportunity_cycle"];

export default async function EditBlockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = SLUG_LABELS[slug] ?? slug;

  const supabase = await createClient();
  const { data } = await supabase
    .from("content_blocks")
    .select("title, body_html")
    .eq("slug", slug)
    .maybeSingle();

  const isJson = JSON_SLUGS.includes(slug);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-extrabold">{label} 편집</h1>
      <p className="mb-6 text-xs text-gray-500">slug: {slug}</p>
      {isJson ? (
        <JsonBlockForm
          slug={slug}
          initialBody={data?.body_html ?? ""}
        />
      ) : (
        <BlockForm
          slug={slug}
          initialTitle={data?.title ?? label}
          initialBody={data?.body_html ?? ""}
        />
      )}
    </div>
  );
}
