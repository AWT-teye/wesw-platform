"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertBlock(
  slug: string,
  title: string,
  body_html: string
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("content_blocks")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("content_blocks")
      .update({ title, body_html, is_active: true })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("content_blocks")
      .insert({ slug, title, body_html, is_active: true });
    if (error) return { error: error.message };
  }

  revalidatePath(`/admin/blocks/${slug}`);
  revalidatePath("/we");
  return { ok: true };
}
