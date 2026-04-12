import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

type FactCheck = {
  id: string;
  type: "refute" | "expose" | "critique";
  claim: string;
  truth: string;
  source: string;
  created_at: string;
};

const TYPE_CONFIG = {
  refute:   { label: "주장반박", color: "bg-red-600",    border: "border-red-500/40" },
  expose:   { label: "데이터폭로", color: "bg-[#FF6B00]", border: "border-[#FF6B00]/40" },
  critique: { label: "정책비판", color: "bg-blue-600",   border: "border-blue-500/40" },
} as const;

export default async function FactCheckListPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fact_checks")
    .select("id, type, claim, truth, source, created_at")
    .eq("is_active", true)
    .order("order_num", { ascending: false })
    .order("created_at", { ascending: false });

  const items = (data ?? []) as FactCheck[];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Link href="/we" className="mb-8 inline-block text-sm text-gray-500 hover:text-[#FF6B00]">
          ← 메인으로
        </Link>

        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00] mb-3">FACT CHECK</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">팩트체크 전체 목록</h1>
          <p className="mt-2 text-sm text-gray-500">거짓 주장에는 데이터로 답합니다.</p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-sm text-gray-600 py-20">등록된 팩트체크가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {items.map((fc) => {
              const cfg = TYPE_CONFIG[fc.type];
              return (
                <article
                  key={fc.id}
                  className={`rounded-xl border ${cfg.border} bg-gray-900/60 p-6 hover:border-[#FF6B00]/60 transition-colors`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-block rounded-full ${cfg.color} px-3 py-1 text-[11px] font-bold text-white`}>
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-gray-600">
                      {new Date(fc.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>

                  <blockquote className="border-l-4 border-gray-700 pl-4 text-sm italic text-gray-400 leading-relaxed">
                    &ldquo;{fc.claim}&rdquo;
                  </blockquote>

                  <p className="mt-4 text-base font-extrabold text-white leading-snug">
                    {fc.truth}
                  </p>

                  {fc.source && (
                    <p className="mt-2 text-[11px] text-gray-600">
                      출처: {fc.source}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
