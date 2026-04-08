import { createClient } from "@/lib/supabase/server";

/**
 * 단일 후보(정희윤) row 보장 헬퍼.
 * 백오피스에서 후보 정보를 편집할 때 row가 없으면 자동 생성.
 */
export async function getOrCreatePrimaryCandidate() {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("candidates")
    .select("*")
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("candidates")
    .insert({
      name: "정희윤",
      position_type: "mayor",
      district: "수원시",
      slogan: "모든 가능성을, 모두에게. 우리는 수원입니다.",
      sns_links: {},
      display_order: 1,
    })
    .select("*")
    .single();

  if (error) throw new Error("후보 row 생성 실패: " + error.message);
  return created;
}
