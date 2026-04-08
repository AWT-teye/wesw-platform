import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SlideForm from "../SlideForm";

export const dynamic = "force-dynamic";

export default async function EditSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("id, title, subtitle, image_url, link_url, display_order, is_active")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold">슬라이드 편집</h1>
      <SlideForm initial={{ ...data, subtitle: data.subtitle ?? "", link_url: data.link_url ?? "" }} />
    </div>
  );
}
