"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ObserverStatus = "pending" | "confirmed" | "cancelled";

export async function updateObserverStatus(
  id: string,
  next: ObserverStatus
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("observer_applications")
    .update({ status: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/observers");
  revalidatePath("/we/observers");
  return { ok: true };
}

export async function deleteObserverApplication(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("observer_applications")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/observers");
  revalidatePath("/we/observers");
  return { ok: true };
}
