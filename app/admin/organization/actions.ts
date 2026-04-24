"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateAll() {
  revalidatePath("/admin/organization");
  revalidatePath("/we/organization");
}

// ─────────── 노드 편집 ───────────
export type OrgNodeUpdate = {
  id: string;
  name_ko: string;
  name_en?: string | null;
  person_name?: string | null;
  role?: string | null;
  description?: string | null;
  is_visible: boolean;
};

export async function updateOrgNode(input: OrgNodeUpdate) {
  if (!input.id) return { error: "id required" };
  const name_ko = input.name_ko.trim();
  if (!name_ko) return { error: "이름(한글)을 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("org_nodes")
    .update({
      name_ko,
      name_en: input.name_en?.trim() || null,
      person_name: input.person_name?.trim() || null,
      role: input.role?.trim() || null,
      description: input.description?.trim() || null,
      is_visible: !!input.is_visible,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function toggleOrgNodeVisible(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("org_nodes")
    .update({ is_visible: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

// ─────────── 연락처 CRUD ───────────
export type OrgContactInput = {
  id?: string;
  org_node_key?: string | null;
  department: string;
  phone?: string | null;
  email?: string | null;
  display_order: number;
  is_visible: boolean;
};

function sanitizeContact(input: OrgContactInput) {
  const department = input.department.trim();
  if (!department) return { error: "부서명을 입력해 주세요." as const };
  return {
    payload: {
      org_node_key: input.org_node_key?.trim() || null,
      department,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      display_order: Number(input.display_order) || 0,
      is_visible: !!input.is_visible,
    },
  };
}

export async function createOrgContact(input: OrgContactInput) {
  const s = sanitizeContact(input);
  if ("error" in s) return { error: s.error };
  const supabase = await createClient();
  const { error } = await supabase.from("org_contacts").insert(s.payload);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function updateOrgContact(input: OrgContactInput) {
  if (!input.id) return { error: "id required" };
  const s = sanitizeContact(input);
  if ("error" in s) return { error: s.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("org_contacts")
    .update(s.payload)
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function toggleOrgContactVisible(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("org_contacts")
    .update({ is_visible: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteOrgContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("org_contacts")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { ok: true };
}
