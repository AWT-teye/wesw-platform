import { createClient } from "@/lib/supabase/server";
import AdminOrganizationClient, {
  type AdminOrgContact,
  type AdminOrgNode,
} from "./AdminOrganizationClient";

export const dynamic = "force-dynamic";

export default async function AdminOrganizationPage() {
  const supabase = await createClient();

  const [nodesRes, contactsRes] = await Promise.all([
    supabase
      .from("org_nodes")
      .select(
        "id, node_key, name_ko, name_en, role, person_name, description, parent_key, level, display_order, color_scheme, is_visible"
      )
      .order("level", { ascending: true })
      .order("display_order", { ascending: true }),
    supabase
      .from("org_contacts")
      .select(
        "id, org_node_key, department, phone, email, display_order, is_visible"
      )
      .order("display_order", { ascending: true }),
  ]);

  const nodes = (nodesRes.data ?? []) as AdminOrgNode[];
  const contacts = (contactsRes.data ?? []) as AdminOrgContact[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold">조직도 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          조직 노드 내용 수정과 연락처 관리. 트리 구조(상하 관계) 변경은 금번
          미지원 — 필요 시 추후 확장.
        </p>
      </div>

      {nodesRes.error && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          조직 노드 로드 실패: {nodesRes.error.message}
        </p>
      )}
      {contactsRes.error && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          연락처 로드 실패: {contactsRes.error.message}
        </p>
      )}

      <AdminOrganizationClient nodes={nodes} contacts={contacts} />
    </div>
  );
}
