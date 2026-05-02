"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "hero";

/**
 * 'hero' 버킷에 대문 이미지 업로드 후 public URL 반환.
 * 버킷은 Supabase Dashboard 에서 public 으로 생성해둬야 함 (CLAUDE.md 참고).
 */
export async function uploadHeroImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `bg/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error("퍼블릭 URL을 가져오지 못했습니다.");
  return data.publicUrl;
}
