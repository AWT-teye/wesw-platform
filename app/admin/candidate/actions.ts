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
  // 후보소개 페이지용 프로필
  profile_title: string;
  profile_birth: string;
  profile_hometown: string;
  profile_residence: string;
  profile_military: string;
  profile_election: string;
  profile_education: string;
  profile_awards: string;
  profile_career: string;
  // 스토리 3섹션
  story1_title: string;
  story1_body: string;
  story2_title: string;
  story2_body: string;
  story3_title: string;
  story3_body: string;
  // 섹션 노출 여부 토글
  show_slogan: boolean;
  show_vision: boolean;
  show_bio: boolean;
  show_declaration: boolean;
  show_office: boolean;
  show_profile_info: boolean;
  show_stories: boolean;
  // 개별 스토리 노출 여부 (stories_json.show 로 저장)
  show_story1: boolean;
  show_story2: boolean;
  show_story3: boolean;
};

export async function saveCandidate(input: CandidateInput) {
  const supabase = await createClient();
  const candidate = await getOrCreatePrimaryCandidate();

  const profile_json = {
    title: input.profile_title || "",
    birth: input.profile_birth || "",
    hometown: input.profile_hometown || "",
    residence: input.profile_residence || "",
    military: input.profile_military || "",
    election: input.profile_election || "",
    education: input.profile_education || "",
    awards: input.profile_awards || "",
    career: input.profile_career || "",
  };

  const stories_json = [
    { title: input.story1_title || "", body: input.story1_body || "", show: input.show_story1 },
    { title: input.story2_title || "", body: input.story2_body || "", show: input.show_story2 },
    { title: input.story3_title || "", body: input.story3_body || "", show: input.show_story3 },
  ].filter((s) => s.title || s.body);

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
      profile_json,
      stories_json,
      show_slogan: input.show_slogan,
      show_vision: input.show_vision,
      show_bio: input.show_bio,
      show_declaration: input.show_declaration,
      show_office: input.show_office,
      show_profile_info: input.show_profile_info,
      show_stories: input.show_stories,
    })
    .eq("id", candidate.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/candidate");
  revalidatePath("/we");
  revalidatePath("/we/intro");
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
  revalidatePath("/we/intro");
  return { ok: true };
}
