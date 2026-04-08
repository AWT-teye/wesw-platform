import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { togglePolicyActive, deletePolicy } from "./actions";

export const dynamic = "force-dynamic";

const LEVEL_LABELS: Record<number, string> = {
  1: "대공약",
  2: "중공약",
  3: "세부공약",
};

export default async function PoliciesListPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const sp = await searchParams;
  const level = Number(sp.level ?? "1");
  const label = LEVEL_LABELS[level] ?? "공약";

  const supabase = await createClient();
  const { data } = await supabase
    .from("policies")
    .select("id, title, content, level, parent_id, display_order, is_active, like_count, dislike_count")
    .eq("level", level)
    .eq("is_archived", false)
    .order("display_order", { ascending: true });

  const items = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{label} 관리</h1>
        <Link href={`/admin/policies/new?level=${level}`} className="rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
          + 새 {label}
        </Link>
      </div>

      <div className="mt-4 flex gap-2 text-xs">
        {[1, 2, 3].map((l) => (
          <Link key={l} href={`/admin/policies?level=${l}`}
            className={`rounded-full px-3 py-1 font-bold ${l === level ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-700"}`}>
            {LEVEL_LABELS[l]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">순서</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">호불호</th>
              <th className="px-4 py-3">노출</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">등록된 {label}이 없습니다.</td></tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{p.display_order}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{p.title}</p>
                  {p.content && <p className="text-xs text-gray-500 line-clamp-1">{p.content}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">👍 {p.like_count} / 👎 {p.dislike_count}</td>
                <td className="px-4 py-3">
                  <form action={async () => { "use server"; await togglePolicyActive(p.id, !p.is_active); }}>
                    <button className={`rounded-full px-2 py-1 text-xs font-bold ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {p.is_active ? "ON" : "OFF"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/policies/${p.id}?level=${level}`} className="rounded border border-gray-300 px-2 py-1 text-xs hover:border-[#FF6B00] hover:text-[#FF6B00]">편집</Link>
                    <form action={async () => { "use server"; await deletePolicy(p.id); }}>
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
