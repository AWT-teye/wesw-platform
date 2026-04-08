import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleOrgActive, deleteOrg } from "./actions";

export const dynamic = "force-dynamic";

export default async function OrgListPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("org_chart_members")
    .select("id, chart_type, name, position, department, phone, display_order, is_active")
    .eq("is_archived", false)
    .order("chart_type")
    .order("display_order");

  const items = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">조직도/연락처 관리</h1>
        <Link href="/admin/org/new" className="rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
          + 새 멤버
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">구분</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">직책</th>
              <th className="px-4 py-3">부서</th>
              <th className="px-4 py-3">전화</th>
              <th className="px-4 py-3">노출</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">등록된 멤버가 없습니다.</td></tr>
            )}
            {items.map((m) => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-xs">{m.chart_type === "party" ? "당" : "캠프"}</td>
                <td className="px-4 py-3 font-semibold">{m.name}</td>
                <td className="px-4 py-3">{m.position}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{m.department ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{m.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <form action={async () => { "use server"; await toggleOrgActive(m.id, !m.is_active); }}>
                    <button className={`rounded-full px-2 py-1 text-xs font-bold ${m.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {m.is_active ? "ON" : "OFF"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/org/${m.id}`} className="rounded border border-gray-300 px-2 py-1 text-xs hover:border-[#FF6B00] hover:text-[#FF6B00]">편집</Link>
                    <form action={async () => { "use server"; await deleteOrg(m.id); }}>
                      <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">삭제</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
