"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * announcements CRUD Server Actions
 * - 인증/권한은 middleware + RLS가 이중으로 보장
 * - category: 'party' | 'election' (CHECK 제약)
 */

export type AnnouncementInput = {
  id?: string;
  category: "party" | "election";
  title: string;
  content: string;
  is_pinned: boolean;
  is_active: boolean;
};

export async function createAnnouncement(input: AnnouncementInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  const { error } = await supabase.from("announcements").insert({
    category: input.category,
    title: input.title,
    content: input.content,
    is_pinned: input.is_pinned,
    is_active: input.is_active,
    author_id: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  revalidatePath("/we");
  return { ok: true };
}

export async function updateAnnouncement(input: AnnouncementInput) {
  if (!input.id) return { error: "id required" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .update({
      category: input.category,
      title: input.title,
      content: input.content,
      is_pinned: input.is_pinned,
      is_active: input.is_active,
    })
    .eq("id", input.id);

  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  revalidatePath("/we");
  return { ok: true };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();

  // 소프트 삭제: is_archived = true
  const { error } = await supabase
    .from("announcements")
    .update({ is_archived: true, is_active: false })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  revalidatePath("/we");
  return { ok: true };
}

export async function toggleActive(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  revalidatePath("/we");
  return { ok: true };
}
