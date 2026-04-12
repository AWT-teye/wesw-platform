"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FactCheckInput = {
  type: "refute" | "expose" | "critique";
  claim: string;
  truth: string;
  source: string;
};

export async function createFactCheck(input: FactCheckInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("fact_checks").insert({
    type: input.type,
    claim: input.claim,
    truth: input.truth,
    source: input.source,
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/factcheck");
  revalidatePath("/we");
  revalidatePath("/we/factcheck");
  return { ok: true };
}

export async function toggleFactCheck(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fact_checks")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/factcheck");
  revalidatePath("/we");
  revalidatePath("/we/factcheck");
  return { ok: true };
}

export async function deleteFactCheck(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fact_checks")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/factcheck");
  revalidatePath("/we");
  revalidatePath("/we/factcheck");
  return { ok: true };
}
