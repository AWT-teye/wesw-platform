"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type OrgInput = {
  id?: string;
  chart_type: "party" | "election";
  name: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  photo_url: string;
  display_order: number;
  is_active: boolean;
};

export async function createOrg(input: OrgInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("org_chart_members").insert({
    chart_type: input.chart_type,
    name: input.name,
    position: input.position,
    department: input.department || null,
    phone: input.phone || null,
    email: input.email || null,
    photo_url: input.photo_url || null,
    display_order: input.display_order,
    is_active: input.is_active,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/org");
  revalidatePath("/we");
  return { ok: true };
}

export async function updateOrg(input: OrgInput) {
  if (!input.id) return { error: "id required" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("org_chart_members")
    .update({
      chart_type: input.chart_type,
      name: input.name,
      position: input.position,
      department: input.department || null,
      phone: input.phone || null,
      email: input.email || null,
      photo_url: input.photo_url || null,
      display_order: input.display_order,
      is_active: input.is_active,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/org");
  revalidatePath("/we");
  return { ok: true };
}

export async function deleteOrg(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("org_chart_members")
    .update({ is_archived: true, is_active: false })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/org");
  revalidatePath("/we");
  return { ok: true };
}

export async function toggleOrgActive(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("org_chart_members")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/org");
  revalidatePath("/we");
  return { ok: true };
}
