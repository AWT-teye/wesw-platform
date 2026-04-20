"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertProposeIntro(input: {
  title: string;
  subtitle: string;
  warning: string;
}) {
  const supabase = await createClient();
  const slug = "we_propose_intro";

  const payload = {
    slug,
    title: input.title,
    body_html: "",
    body_json: {
      subtitle: input.subtitle,
      warning: input.warning,
    },
    is_active: true,
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
    const { error } = await supabase.from("content_blocks").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/blocks/we_propose_intro");
  revalidatePath("/we/propose");
  return { ok: true };
}
