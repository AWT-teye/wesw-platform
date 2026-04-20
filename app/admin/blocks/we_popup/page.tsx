import { createClient } from "@/lib/supabase/server";
import PopupBlockForm from "./PopupBlockForm";

export const dynamic = "force-dynamic";

export default async function EditPopupPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_blocks")
    .select("title, body_html, body_json, is_active")
    .eq("slug", "we_popup")
    .maybeSingle();

  const json = data?.body_json as
    | { button_text?: string; button_link?: string }
    | null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-extrabold">메인 팝업 편집</h1>
      <p className="mb-6 text-xs text-gray-500">slug: we_popup</p>
      <PopupBlockForm
        initialTitle={data?.title ?? ""}
        initialBody={data?.body_html ?? ""}
        initialButtonText={json?.button_text ?? ""}
        initialButtonLink={json?.button_link ?? ""}
        initialActive={data?.is_active ?? false}
      />
    </div>
  );
}
