"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreatePrimaryCandidate } from "@/lib/candidate";
import { extractYoutubeId } from "./youtubeUtils";

export type SnsLinksInput = {
  sns_naver: string;
  sns_instagram: string;
  sns_facebook: string;
  sns_youtube_channel: string;
};

export async function saveSnsLinks(input: SnsLinksInput) {
  const supabase = await createClient();
  const c = await getOrCreatePrimaryCandidate();
  const { error } = await supabase
    .from("candidates")
    .update({
      sns_naver: input.sns_naver || null,
      sns_instagram: input.sns_instagram || null,
      sns_facebook: input.sns_facebook || null,
      sns_youtube_channel: input.sns_youtube_channel || null,
    })
    .eq("id", c.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sns");
  revalidatePath("/we/sns");
  return { ok: true };
}

// ─── YouTube Videos ──────────────────────────────────────────

export async function addYoutubeVideo(input: {
  title: string;
  youtube_url: string;
  thumbnail_url?: string;
}) {
  const supabase = await createClient();
  const c = await getOrCreatePrimaryCandidate();
  const videoId = extractYoutubeId(input.youtube_url);
  const thumb =
    input.thumbnail_url?.trim() ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

  const { data: maxRow } = await supabase
    .from("candidate_youtube_videos")
    .select("display_order")
    .eq("candidate_id", c.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.display_order ?? 0) + 1;

  const { error } = await supabase.from("candidate_youtube_videos").insert({
    candidate_id: c.id,
    title: input.title,
    youtube_url: input.youtube_url,
    thumbnail_url: thumb,
    display_order: nextOrder,
    is_visible: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/sns");
  revalidatePath("/we/sns");
  return { ok: true };
}

export async function deleteYoutubeVideo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate_youtube_videos")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sns");
  revalidatePath("/we/sns");
  return { ok: true };
}

export async function toggleYoutubeVisibility(id: string, value: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate_youtube_videos")
    .update({ is_visible: value })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sns");
  revalidatePath("/we/sns");
  return { ok: true };
}

export async function moveYoutubeVideo(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const c = await getOrCreatePrimaryCandidate();

  const { data: current } = await supabase
    .from("candidate_youtube_videos")
    .select("id, display_order")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { error: "not found" };

  const { data: neighbor } = await supabase
    .from("candidate_youtube_videos")
    .select("id, display_order")
    .eq("candidate_id", c.id)
    .order("display_order", { ascending: direction === "down" })
    [direction === "up" ? "lt" : "gt"]("display_order", current.display_order)
    .limit(1)
    .maybeSingle();
  if (!neighbor) return { ok: true };

  const { error: e1 } = await supabase
    .from("candidate_youtube_videos")
    .update({ display_order: neighbor.display_order })
    .eq("id", current.id);
  if (e1) return { error: e1.message };

  const { error: e2 } = await supabase
    .from("candidate_youtube_videos")
    .update({ display_order: current.display_order })
    .eq("id", neighbor.id);
  if (e2) return { error: e2.message };

  revalidatePath("/admin/sns");
  revalidatePath("/we/sns");
  return { ok: true };
}

// ─── Statements ──────────────────────────────────────────────

export async function addStatement(input: {
  content: string;
  source?: string;
  stated_at?: string;
}) {
  const supabase = await createClient();
  const c = await getOrCreatePrimaryCandidate();

  const { data: maxRow } = await supabase
    .from("candidate_statements")
    .select("display_order")
    .eq("candidate_id", c.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.display_order ?? 0) + 1;

  const { error } = await supabase.from("candidate_statements").insert({
    candidate_id: c.id,
    content: input.content,
    source: input.source || null,
    stated_at: input.stated_at || null,
    display_order: nextOrder,
    is_visible: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/sns");
  revalidatePath("/we/sns");
  return { ok: true };
}

export async function deleteStatement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate_statements")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sns");
  revalidatePath("/we/sns");
  return { ok: true };
}

export async function toggleStatementVisibility(id: string, value: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate_statements")
    .update({ is_visible: value })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sns");
  revalidatePath("/we/sns");
  return { ok: true };
}
