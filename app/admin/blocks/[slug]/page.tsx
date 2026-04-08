import { createClient } from "@/lib/supabase/server";
import BlockForm from "../BlockForm";

export const dynamic = "force-dynamic";

const SLUG_LABELS: Record<string, string> = {
  we_camp_intro: "선거캠프 소개",
  we_slogan: "슬로건",
  we_footer_legal: "푸터 (선관위 의무표시)",
};

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

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-extrabold">{label} 편집</h1>
      <p className="mb-6 text-xs text-gray-500">slug: {slug}</p>
      <BlockForm
        slug={slug}
        initialTitle={data?.title ?? label}
        initialBody={data?.body_html ?? ""}
      />
    </div>
  );
}
