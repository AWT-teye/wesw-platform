import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnnouncementForm from "../AnnouncementForm";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, category, title, content, is_pinned, is_active")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold">한마디 편집</h1>
      <AnnouncementForm initial={data} />
    </div>
  );
}
