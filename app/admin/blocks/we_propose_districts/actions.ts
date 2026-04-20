"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertProposeDistricts(districts: string[]) {
  const cleaned = districts
    .map((d) => d.trim())
    .filter((d) => d.length > 0);
  if (cleaned.length === 0) {
    return { error: "최소 1개 이상의 거주지역을 입력해 주세요." };
  }

  const supabase = await createClient();
  const slug = "we_propose_districts";

  const payload = {
    slug,
    title: "거주지역 목록",
    body_html: "",
    body_json: cleaned,
    is_active: true,
  };

  const { data: existing } = await supabase
    .from("content_blocks")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("content_blocks")
      .update(payload)
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("content_blocks").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/blocks/we_propose_districts");
  revalidatePath("/we/propose");
  return { ok: true };
}
