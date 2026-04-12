import Link from "next/link";

type FactCheck = {
  id: string;
  type: "refute" | "expose" | "critique";
  claim: string;
  truth: string;
  source: string;
};

const TYPE_CONFIG = {
  refute:   { label: "주장반박", color: "bg-red-600",    border: "border-red-500/40" },
  expose:   { label: "데이터폭로", color: "bg-[#FF6B00]", border: "border-[#FF6B00]/40" },
  critique: { label: "정책비판", color: "bg-blue-600",   border: "border-blue-500/40" },
} as const;

export default function FactCheckSection({ items }: { items: FactCheck[] }) {
  return (
    <section aria-label="팩트체크" className="w-full bg-[#0a0a0a] py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00] mb-3">FACT CHECK</p>
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            팩트로 검증합니다
          </h2>
          <p className="mt-2 text-sm text-gray-500">거짓 주장에는 데이터로 답합니다.</p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-sm text-gray-600">등록된 팩트체크가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {items.map((fc) => {
              const cfg = TYPE_CONFIG[fc.type];
              return (
                <div
                  key={fc.id}
                  className={`rounded-xl border ${cfg.border} bg-gray-900/60 p-6 hover:border-[#FF6B00]/60 transition-colors`}
                >
                  <span className={`inline-block rounded-full ${cfg.color} px-3 py-1 text-[11px] font-bold text-white mb-4`}>
                    {cfg.label}
                  </span>

                  {/* 상대 주장 — 인용구 스타일 */}
                  <blockquote className="border-l-4 border-gray-700 pl-4 text-sm italic text-gray-400 leading-relaxed">
                    &ldquo;{fc.claim}&rdquo;
                  </blockquote>

                  {/* 팩트 — 굵게 */}
                  <p className="mt-4 text-base font-extrabold text-white leading-snug">
                    {fc.truth}
                  </p>

                  {/* 출처 — 작게 */}
                  {fc.source && (
                    <p className="mt-2 text-[11px] text-gray-600">
                      출처: {fc.source}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/we/factcheck"
            className="inline-block rounded-lg border border-[#FF6B00] px-6 py-3 text-sm font-bold text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
          >
            전체 팩트체크 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
