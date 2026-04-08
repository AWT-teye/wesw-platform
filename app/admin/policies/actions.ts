"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreatePrimaryCandidate } from "@/lib/candidate";

export type PolicyInput = {
  id?: string;
  level: number;
  parent_id: string | null;
  title: string;
  content: string;
  display_order: number;
  is_active: boolean;
};

export async function createPolicy(input: PolicyInput) {
  const supabase = await createClient();
  const candidate = await getOrCreatePrimaryCandidate();

  const { error } = await supabase.from("policies").insert({
    candidate_id: candidate.id,
    parent_id: input.parent_id,
    level: input.level,
    title: input.title,
    content: input.content || null,
    display_order: input.display_order,
    is_active: input.is_active,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/policies");
  revalidatePath("/we");
  return { ok: true };
}

export async function updatePolicy(input: PolicyInput) {
  if (!input.id) return { error: "id required" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("policies")
    .update({
      parent_id: input.parent_id,
      level: input.level,
      title: input.title,
      content: input.content || null,
      display_order: input.display_order,
      is_active: input.is_active,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/policies");
  revalidatePath("/we");
  return { ok: true };
}

export async function deletePolicy(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("policies")
    .update({ is_archived: true, is_active: false })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/policies");
  revalidatePath("/we");
  return { ok: true };
}

export async function togglePolicyActive(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("policies")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/policies");
  revalidatePath("/we");
  return { ok: true };
}
