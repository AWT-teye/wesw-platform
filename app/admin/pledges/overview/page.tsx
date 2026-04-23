import { createClient } from "@/lib/supabase/server";
import { getOrCreatePrimaryCandidate } from "@/lib/candidate";
import OverviewForm from "./OverviewForm";

export const dynamic = "force-dynamic";

export default async function AdminPledgeOverviewPage() {
  const c = await getOrCreatePrimaryCandidate();
  const supabase = await createClient();

  const { data } = await supabase
    .from("pledge_overview")
    .select(
      "intro_text, popup_image_url, poster_url, bulletin_url, top10_url, plan_book_url"
    )
    .eq("candidate_id", c.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold">공약 소개 관리</h1>
      <OverviewForm
        initial={{
          intro_text: data?.intro_text ?? "",
          popup_image_url: data?.popup_image_url ?? "",
          poster_url: data?.poster_url ?? "",
          bulletin_url: data?.bulletin_url ?? "",
          top10_url: data?.top10_url ?? "",
          plan_book_url: data?.plan_book_url ?? "",
        }}
      />
    </div>
  );
}
