import { createClient } from "@/lib/supabase/server";
import ProposeIntroForm from "./ProposeIntroForm";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  title: "시민 공약제안",
  subtitle:
    "수원의 가능성을 함께 만들어 갑니다. 당신의 아이디어를 들려주세요.",
  warning:
    "타 후보 비방, 허위사실 유포 등 공직선거법 위반 게시물은 즉시 삭제되며, 작성된 글은 삭제할 수 없습니다. 100자 이내로 정중히 작성해 주세요.",
};

export default async function EditProposeIntroPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_blocks")
    .select("title, body_json")
    .eq("slug", "we_propose_intro")
    .maybeSingle();

  const json = (data?.body_json ?? null) as
    | { subtitle?: string; warning?: string }
    | null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-extrabold">
        공약제안 페이지 상단 편집
      </h1>
      <p className="mb-6 text-xs text-gray-500">slug: we_propose_intro</p>
      <ProposeIntroForm
        initialTitle={data?.title ?? DEFAULTS.title}
        initialSubtitle={json?.subtitle ?? DEFAULTS.subtitle}
        initialWarning={json?.warning ?? DEFAULTS.warning}
      />
    </div>
  );
}
