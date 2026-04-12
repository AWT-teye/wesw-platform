import { createClient } from "@/lib/supabase/server";
import { toggleFactCheck, deleteFactCheck } from "./actions";
import FactCheckForm from "./FactCheckForm";

export const dynamic = "force-dynamic";

type FactCheck = {
  id: string;
  type: "refute" | "expose" | "critique";
  claim: string;
  truth: string;
  source: string;
  is_active: boolean;
  order_num: number;
  created_at: string;
};

const TYPE_LABEL = {
  refute: "주장반박",
  expose: "데이터폭로",
  critique: "정책비판",
} as const;

const TYPE_COLOR = {
  refute: "bg-red-100 text-red-700",
  expose: "bg-orange-100 text-orange-700",
  critique: "bg-blue-100 text-blue-700",
} as const;

export default async function AdminFactCheckPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fact_checks")
    .select("id, type, claim, truth, source, is_active, order_num, created_at")
    .order("created_at", { ascending: false });

  const items = (data ?? []) as FactCheck[];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">팩트체크 관리</h1>
      <p className="mt-2 text-sm text-gray-600">등록 즉시 메인페이지에 게시됩니다.</p>

      {/* 등록 폼 */}
      <div className="mt-6">
        <FactCheckForm />
      </div>

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </p>
      )}

      {/* 목록 */}
      <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">상대 주장</th>
              <th className="px-4 py-3">팩트</th>
              <th className="px-4 py-3">노출</th>
              <th className="px-4 py-3">작성일</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  등록된 팩트체크가 없습니다.
                </td>
              </tr>
            )}
            {items.map((fc) => (
              <tr key={fc.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${TYPE_COLOR[fc.type]}`}>
                    {TYPE_LABEL[fc.type]}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate text-gray-600">{fc.claim}</td>
                <td className="px-4 py-3 max-w-[200px] truncate font-semibold">{fc.truth}</td>
                <td className="px-4 py-3">
                  <form action={async () => { "use server"; await toggleFactCheck(fc.id, !fc.is_active); }}>
                    <button
                      type="submit"
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        fc.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {fc.is_active ? "ON" : "OFF"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(fc.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <form action={async () => { "use server"; await deleteFactCheck(fc.id); }}>
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
