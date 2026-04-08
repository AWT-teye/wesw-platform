import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleActive, deleteAnnouncement } from "./actions";

type Announcement = {
  id: string;
  category: "party" | "election";
  title: string;
  content: string;
  is_pinned: boolean;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function AnnouncementsListPage() {
  const supabase = await createClient();

  // 관리자는 RLS상 비활성·블라인드도 다 볼 수 있어야 정상이지만,
  // announcements는 select 정책이 is_active=true 만 노출하도록 잡혀 있어
  // 관리 화면에서는 admin도 보존(아카이브 제외)된 모든 행을 봐야 합니다.
  // 우선은 RLS 정책 그대로 — 비활성 행은 안 보일 수 있음. (추후 정책 보완 필요)
  const { data, error } = await supabase
    .from("announcements")
    .select(
      "id, category, title, content, is_pinned, is_active, is_archived, created_at"
    )
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const items = (data || []) as Announcement[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">한마디 (announcements)</h1>
        <Link
          href="/admin/announcements/new"
          className="rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
        >
          + 새 한마디
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">분류</th>
              <th className="px-4 py-3">고정</th>
              <th className="px-4 py-3">노출</th>
              <th className="px-4 py-3">작성일</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  등록된 한마디가 없습니다.
                </td>
              </tr>
            )}
            {items.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-semibold">{a.title}</td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {a.category === "party" ? "당" : "선거"}
                </td>
                <td className="px-4 py-3 text-xs">
                  {a.is_pinned ? "📌" : "—"}
                </td>
                <td className="px-4 py-3 text-xs">
                  <form
                    action={async () => {
                      "use server";
                      await toggleActive(a.id, !a.is_active);
                    }}
                  >
                    <button
                      type="submit"
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        a.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {a.is_active ? "ON" : "OFF"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(a.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/announcements/${a.id}`}
                      className="rounded border border-gray-300 px-2 py-1 text-xs hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    >
                      편집
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteAnnouncement(a.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        ※ 삭제는 소프트 삭제(is_archived=true)로 처리됩니다. 데이터는 보존됩니다.
      </p>
    </div>
  );
}
