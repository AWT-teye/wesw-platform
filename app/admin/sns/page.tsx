import { createClient } from "@/lib/supabase/server";
import { getOrCreatePrimaryCandidate } from "@/lib/candidate";
import SnsLinksSection from "./SnsLinksSection";
import YoutubeSection from "./YoutubeSection";
import StatementsSection from "./StatementsSection";

export const dynamic = "force-dynamic";

export default async function AdminSnsPage() {
  const c = await getOrCreatePrimaryCandidate();
  const supabase = await createClient();

  const [videos, statements] = await Promise.all([
    supabase
      .from("candidate_youtube_videos")
      .select("id, title, youtube_url, thumbnail_url, is_visible, display_order")
      .eq("candidate_id", c.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("candidate_statements")
      .select("id, content, source, stated_at, is_visible, display_order")
      .eq("candidate_id", c.id)
      .order("display_order", { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <h1 className="text-2xl font-extrabold">SNS 관리</h1>

      <SnsLinksSection
        initial={{
          sns_naver: c.sns_naver ?? "",
          sns_instagram: c.sns_instagram ?? "",
          sns_facebook: c.sns_facebook ?? "",
          sns_youtube_channel: c.sns_youtube_channel ?? "",
        }}
      />

      <YoutubeSection videos={videos.data ?? []} />

      <StatementsSection statements={statements.data ?? []} />
    </div>
  );
}
