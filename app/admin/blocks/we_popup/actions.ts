"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertPopupBlock(formData: {
  title: string;
  body_html: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
}) {
  const supabase = await createClient();
  const slug = "we_popup";

  const payload = {
    slug,
    title: formData.title,
    body_html: formData.body_html,
    body_json: {
      button_text: formData.button_text,
      button_link: formData.button_link,
    },
    is_active: formData.is_active,
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
    const { error } = await supabase
      .from("content_blocks")
      .insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/blocks/we_popup");
  revalidatePath("/we");
  return { ok: true };
}
