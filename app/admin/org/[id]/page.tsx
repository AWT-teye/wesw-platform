import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrgForm from "../OrgForm";

export const dynamic = "force-dynamic";

export default async function EditOrgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("org_chart_members")
    .select("id, chart_type, name, position, department, phone, email, photo_url, display_order, is_active")
    .eq("id", id)
    .single();
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold">조직도 멤버 편집</h1>
      <OrgForm initial={{
        ...data,
        department: data.department ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        photo_url: data.photo_url ?? "",
      }} />
    </div>
  );
}
