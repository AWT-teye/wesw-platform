"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreatePrimaryCandidate } from "@/lib/candidate";

export type PledgeOverviewInput = {
  intro_text: string;
  popup_image_url: string;
  poster_url: string;
  bulletin_url: string;
  top10_url: string;
  plan_book_url: string;
};

export async function savePledgeOverview(input: PledgeOverviewInput) {
  const supabase = await createClient();
  const candidate = await getOrCreatePrimaryCandidate();

  const payload = {
    candidate_id: candidate.id,
    intro_text: input.intro_text || null,
    popup_image_url: input.popup_image_url || null,
    poster_url: input.poster_url || null,
    bulletin_url: input.bulletin_url || null,
    top10_url: input.top10_url || null,
    plan_book_url: input.plan_book_url || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("pledge_overview")
    .upsert(payload, { onConflict: "candidate_id" });

  if (error) return { error: error.message };
  revalidatePath("/admin/pledges/overview");
  revalidatePath("/we/pledges");
  return { ok: true };
}

export type RegionPledgeInput = {
  id: string;
  content: string;
  popup_image_url: string;
  display_order: number;
  is_visible: boolean;
};

export async function saveRegionPledge(input: RegionPledgeInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("region_pledges")
    .update({
      content: input.content || null,
      popup_image_url: input.popup_image_url || null,
      display_order: input.display_order,
      is_visible: input.is_visible,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/pledges/region");
  revalidatePath("/we/pledges");
  return { ok: true };
}

// 중공약의 10대공약 포함 토글
export async function togglePolicyTop10(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("policies")
    .update({ is_top10: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/policies");
  revalidatePath("/we/pledges");
  return { ok: true };
}
