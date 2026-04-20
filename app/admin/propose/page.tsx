import { createClient } from "@/lib/supabase/server";
import { deletePropose, togglePropose } from "./actions";

export const dynamic = "force-dynamic";

type Suggestion = {
  id: string;
  content: string;
  district: string;
  is_active: boolean;
  created_at: string;
};

export default async function AdminProposePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("propose_suggestions")
    .select("id, content, district, is_active, created_at")
    .order("created_at", { ascending: false });

  const items = (data ?? []) as Suggestion[];
  const totalActive = items.filter((s) => s.is_active).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">공약제안 관리</h1>
      <p className="mt-2 text-sm text-gray-600">
        선거법 위반·비방·허위사실 게시물은 즉시 삭제해 주세요. 삭제된 제안은
        복구할 수 없습니다.
      </p>

      <div className="mt-4 flex gap-4 text-sm">
        <p className="rounded-lg border border-gray-200 bg-white px-4 py-2">
          전체:{" "}
          <span className="font-bold text-[#FF6B00]">{items.length}</span>
        </p>
        <p className="rounded-lg border border-gray-200 bg-white px-4 py-2">
          공개 중:{" "}
          <span className="font-bold text-green-600">{totalActive}</span>
        </p>
        <p className="rounded-lg border border-gray-200 bg-white px-4 py-2">
          비공개:{" "}
          <span className="font-bold text-gray-500">
            {items.length - totalActive}
          </span>
        </p>
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
              <th className="px-4 py-3">거주지역</th>
              <th className="px-4 py-3">내용</th>
              <th className="px-4 py-3">노출</th>
              <th className="px-4 py-3">작성일</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  등록된 제안이 없습니다.
                </td>
              </tr>
            )}
            {items.map((s) => (
              <tr key={s.id} className="border-t border-gray-100 align-top">
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#FF6B00]/10 px-2 py-1 text-[11px] font-bold text-[#FF6B00]">
                    {s.district}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[420px] whitespace-pre-line break-words text-gray-800">
                  {s.content}
                </td>
                <td className="px-4 py-3">
                  <form
                    action={async () => {
                      "use server";
                      await togglePropose(s.id, !s.is_active);
                    }}
                  >
                    <button
                      type="submit"
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        s.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {s.is_active ? "ON" : "OFF"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(s.created_at).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <form
                    action={async () => {
                      "use server";
                      await deletePropose(s.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
