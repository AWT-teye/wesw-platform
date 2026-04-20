"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProposeInput = {
  content: string;
  district: string;
};

async function fetchAllowedDistricts(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_blocks")
    .select("body_json")
    .eq("slug", "we_propose_districts")
    .maybeSingle();
  const raw = data?.body_json;
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === "string" && v.length > 0);
  }
  return ["장안구", "권선구", "팔달구", "영통구", "기타"];
}

export async function createPropose(input: ProposeInput) {
  const content = input.content.trim();
  if (!content) return { error: "내용을 입력해 주세요." };
  if (content.length > 500) return { error: "500자 이내로 작성해 주세요." };

  const allowed = await fetchAllowedDistricts();
  if (!allowed.includes(input.district)) {
    return { error: "거주지역을 선택해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("propose_suggestions").insert({
    content,
    district: input.district,
    is_active: true,
  });
  if (error) return { error: error.message };

  revalidatePath("/we/propose");
  revalidatePath("/admin/propose");
  return { ok: true };
}
