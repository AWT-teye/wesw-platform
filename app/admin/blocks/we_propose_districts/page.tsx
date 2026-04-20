import { createClient } from "@/lib/supabase/server";
import DistrictsForm from "./DistrictsForm";

export const dynamic = "force-dynamic";

const DEFAULT_DISTRICTS = ["장안구", "권선구", "팔달구", "영통구", "기타"];

export default async function EditProposeDistrictsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_blocks")
    .select("body_json")
    .eq("slug", "we_propose_districts")
    .maybeSingle();

  const raw = data?.body_json;
  const list = Array.isArray(raw)
    ? raw.filter((v): v is string => typeof v === "string")
    : DEFAULT_DISTRICTS;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-extrabold">
        거주지역 목록 편집
      </h1>
      <p className="mb-6 text-xs text-gray-500">slug: we_propose_districts</p>
      <DistrictsForm initialList={list} />
    </div>
  );
}
