"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SlideInput = {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
};

export async function createSlide(input: SlideInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("hero_slides").insert({
    title: input.title,
    subtitle: input.subtitle || null,
    image_url: input.image_url,
    link_url: input.link_url || null,
    display_order: input.display_order,
    is_active: input.is_active,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/carousel");
  revalidatePath("/we");
  return { ok: true };
}

export async function updateSlide(input: SlideInput) {
  if (!input.id) return { error: "id required" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({
      title: input.title,
      subtitle: input.subtitle || null,
      image_url: input.image_url,
      link_url: input.link_url || null,
      display_order: input.display_order,
      is_active: input.is_active,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/carousel");
  revalidatePath("/we");
  return { ok: true };
}

export async function deleteSlide(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({ is_archived: true, is_active: false })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/carousel");
  revalidatePath("/we");
  return { ok: true };
}

export async function toggleSlideActive(id: string, next: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/carousel");
  revalidatePath("/we");
  return { ok: true };
}
