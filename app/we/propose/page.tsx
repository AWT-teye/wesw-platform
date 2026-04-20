import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProposeForm from "./ProposeForm";

export const revalidate = 30;

type Suggestion = {
  id: string;
  content: string;
  district: string;
  created_at: string;
};

const DEFAULT_INTRO = {
  title: "시민 공약제안",
  subtitle:
    "수원의 가능성을 함께 만들어 갑니다. 당신의 아이디어를 들려주세요.",
  warning:
    "타 후보 비방, 허위사실 유포 등 공직선거법 위반 게시물은 즉시 삭제되며, 작성된 글은 삭제할 수 없습니다. 100자 이내로 정중히 작성해 주세요.",
};
const DEFAULT_DISTRICTS = ["장안구", "권선구", "팔달구", "영통구", "기타"];

export default async function ProposePage() {
  const supabase = await createClient();

  const [introRes, districtsRes, listRes] = await Promise.all([
    supabase
      .from("content_blocks")
      .select("title, body_json")
      .eq("slug", "we_propose_intro")
      .maybeSingle(),
    supabase
      .from("content_blocks")
      .select("body_json")
      .eq("slug", "we_propose_districts")
      .maybeSingle(),
    supabase
      .from("propose_suggestions")
      .select("id, content, district, created_at", { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const introJson = (introRes.data?.body_json ?? null) as
    | { subtitle?: string; warning?: string }
    | null;
  const title = introRes.data?.title || DEFAULT_INTRO.title;
  const subtitle = introJson?.subtitle || DEFAULT_INTRO.subtitle;
  const warning = introJson?.warning || DEFAULT_INTRO.warning;

  const rawDistricts = districtsRes.data?.body_json;
  const districts = Array.isArray(rawDistricts)
    ? rawDistricts.filter(
        (v): v is string => typeof v === "string" && v.length > 0
      )
    : DEFAULT_DISTRICTS;

  const items = (listRes.data ?? []) as Suggestion[];
  const total = listRes.count ?? items.length;

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <Link
          href="/we"
          className="mb-6 inline-block text-xs text-gray-500 hover:text-[#FF6B00]"
        >
          ← 메인으로
        </Link>

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00]">
            PROPOSE
          </p>
          <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>

        {/* 선거법 경고 레드박스 */}
        <div
          role="alert"
          className="mb-6 rounded-lg border-2 border-red-600 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
        >
          <p className="mb-1 font-bold">⚠️ 선거법 위반 경고</p>
          <p className="whitespace-pre-line">{warning}</p>
        </div>

        <ProposeForm districts={districts} />

        {/* 총 제안 수 + 목록 */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-extrabold md:text-xl">등록된 제안</h2>
            <p className="text-xs text-gray-500">
              총{" "}
              <span className="font-bold text-[#FF6B00]">
                {total.toLocaleString("ko-KR")}
              </span>
              건
            </p>
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
              아직 등록된 제안이 없습니다. 첫 제안을 남겨주세요.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#FF6B00]/10 px-2 py-0.5 text-[11px] font-bold text-[#FF6B00]">
                      {s.district}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(s.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-line break-words text-sm leading-relaxed text-gray-800">
                    {s.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
