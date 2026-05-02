"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type HeroSettingsInput = {
  id?: string;
  background_image_url: string;
  overlay_opacity: number;
  overlay_color: string;
  use_image_background: boolean;
  badge_text: string;
  headline_main: string;
  headline_accent: string;
  subline: string;
  cta_primary_text: string;
  cta_primary_url: string;
  cta_secondary_text: string;
  cta_secondary_url: string;
};

export async function saveHeroSettings(input: HeroSettingsInput) {
  const supabase = await createClient();

  const payload = {
    background_image_url: input.background_image_url || null,
    overlay_opacity: Math.max(0, Math.min(1, Number(input.overlay_opacity) || 0)),
    overlay_color: input.overlay_color || "#000000",
    use_image_background: !!input.use_image_background,
    badge_text: input.badge_text || null,
    headline_main: input.headline_main || null,
    headline_accent: input.headline_accent || null,
    subline: input.subline || null,
    cta_primary_text: input.cta_primary_text || null,
    cta_primary_url: input.cta_primary_url || null,
    cta_secondary_text: input.cta_secondary_text || null,
    cta_secondary_url: input.cta_secondary_url || null,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("hero_settings")
      .update(payload)
      .eq("id", input.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("hero_settings").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/hero");
  revalidatePath("/we");
  return { ok: true };
}
