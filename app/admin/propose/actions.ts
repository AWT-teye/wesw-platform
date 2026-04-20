"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deletePropose(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("propose_suggestions")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/propose");
  revalidatePath("/we/propose");
  return { ok: true };
}

export async function togglePropose(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("propose_suggestions")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/propose");
  revalidatePath("/we/propose");
  return { ok: true };
}
