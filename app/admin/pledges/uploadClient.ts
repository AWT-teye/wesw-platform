"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "pledges";

/**
 * 'pledges' 버킷에 이미지 업로드 후 public URL 반환.
 * 버킷은 Supabase Dashboard에서 public으로 생성해둬야 함 (CLAUDE.md 참고).
 */
export async function uploadPledgeImage(file: File, prefix: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error("퍼블릭 URL을 가져오지 못했습니다.");
  return data.publicUrl;
}
