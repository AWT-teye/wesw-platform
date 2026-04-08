"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreatePrimaryCandidate } from "@/lib/candidate";

export type CandidateInput = {
  name: string;
  position_type: "mayor" | "city_council" | "provincial_council" | "proportional";
  district: string;
  photo_url: string;
  bio: string;
  declaration: string;
  vision: string;
  slogan: string;
  office_info: string;
};

export async function saveCandidate(input: CandidateInput) {
  const supabase = await createClient();
  const candidate = await getOrCreatePrimaryCandidate();
  const { error } = await supabase
    .from("candidates")
    .update({
      name: input.name,
      position_type: input.position_type,
      district: input.district || null,
      photo_url: input.photo_url || null,
      bio: input.bio || null,
      declaration: input.declaration || null,
      vision: input.vision || null,
      slogan: input.slogan || null,
      office_info: input.office_info || null,
    })
    .eq("id", candidate.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/candidate");
  revalidatePath("/we");
  return { ok: true };
}

export type SnsLinks = {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  kakao?: string;
  discord?: string;
  twitter?: string;
};

export async function saveSns(links: SnsLinks) {
  const supabase = await createClient();
  const candidate = await getOrCreatePrimaryCandidate();
  const cleaned: SnsLinks = {};
  (Object.keys(links) as (keyof SnsLinks)[]).forEach((k) => {
    if (links[k]) cleaned[k] = links[k];
  });
  const { error } = await supabase
    .from("candidates")
    .update({ sns_links: cleaned })
    .eq("id", candidate.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/candidate/sns");
  revalidatePath("/we");
  return { ok: true };
}
