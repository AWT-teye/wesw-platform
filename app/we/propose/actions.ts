"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const DISTRICTS = ["장안구", "권선구", "팔달구", "영통구", "기타"] as const;
export type District = (typeof DISTRICTS)[number];

export type ProposeInput = {
  content: string;
  district: District;
};

export async function createPropose(input: ProposeInput) {
  const content = input.content.trim();
  if (!content) return { error: "내용을 입력해 주세요." };
  if (content.length > 100) return { error: "100자 이내로 작성해 주세요." };
  if (!DISTRICTS.includes(input.district)) {
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
