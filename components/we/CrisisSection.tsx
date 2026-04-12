type CrisisStat = {
  label: string;
  value: string;
  unit: string;
  sub: string;
  source: string;
};

type CycleStep = {
  label: string;
};

const DEFAULT_STATS: CrisisStat[] = [
  { label: "재정자립도", value: "37.8", unit: "%", sub: "2000년 89%에서 추락", source: "이투데이 2025.11" },
  { label: "사회복지예산", value: "40", unit: "%+", sub: "산업예산 단 1.5%", source: "2024년 수원시 세출" },
  { label: "청년층 고용률", value: "43.6", unit: "%", sub: "21개월 연속 하락", source: "통계청 2026.01" },
  { label: "고령화율", value: "15.49", unit: "%", sub: "2022년 12.35%에서 급등", source: "G.ECONOMY 2025.03" },
  { label: "1인가구 비율", value: "40.71", unit: "%", sub: "221,066가구", source: "수원시정연구원" },
  { label: "경제성장률", value: "-10.8", unit: "%", sub: "경기도 내 최하위", source: "2020년 기준" },
];

const DEFAULT_CYCLE: CycleStep[] = [
  { label: "기회부재" },
  { label: "인재유출" },
  { label: "기업약화" },
  { label: "세입붕괴" },
  { label: "투자불능" },
  { label: "사회해체" },
];

export default function CrisisSection({
  intro,
  statsJson,
  cycleJson,
  closing,
}: {
  intro: { title: string | null; body_html: string | null } | null;
  statsJson: string | null;
  cycleJson: string | null;
  closing: { title: string | null; body_html: string | null } | null;
}) {
  let stats: CrisisStat[] = DEFAULT_STATS;
  try {
    if (statsJson) stats = JSON.parse(statsJson);
  } catch {}

  let cycle: CycleStep[] = DEFAULT_CYCLE;
  try {
    if (cycleJson) cycle = JSON.parse(cycleJson);
  } catch {}

  return (
    <section aria-label="수원 위기 데이터" className="w-full bg-[#0a0a0a] py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">

        {/* 인트로 텍스트 */}
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00] mb-3">DATA DASHBOARD</p>
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            {intro?.title ?? "수원은 지금, 위기입니다"}
          </h2>
          {intro?.body_html ? (
            <div
              className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 [&_*]:whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: intro.body_html }}
            />
          ) : (
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">
              숫자가 말하는 수원의 현실. 더 이상 미룰 수 없습니다.
            </p>
          )}
        </div>

        {/* 위기 데이터 카드 6개 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {stats.map((s, i) => (
            <div
              key={i}
              className="group rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center hover:border-[#FF6B00]/60 transition-colors"
            >
              <p className="text-xs text-gray-500 mb-2">{s.label}</p>
              <p className="text-4xl font-extrabold text-[#FF6B00] md:text-5xl">
                {s.value}<span className="text-xl">{s.unit}</span>
              </p>
              <p className="mt-2 text-sm font-medium text-red-400">{s.sub}</p>
              <p className="mt-1 text-[10px] text-gray-600">{s.source}</p>
            </div>
          ))}
        </div>

        {/* 기회의 악순환 고리 */}
        <div className="mb-16">
          <h3 className="mb-8 text-center text-lg font-extrabold text-white md:text-xl">
            기회의 악순환 고리
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-0">
            {cycle.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className="rounded-xl border border-gray-700 bg-gray-900/80 px-5 py-3 text-center hover:border-[#FF6B00] transition-colors">
                  <span className="block text-[10px] text-gray-500 mb-1">STEP {i + 1}</span>
                  <span className="text-sm font-bold text-white md:text-base">{step.label}</span>
                </div>
                {i < cycle.length - 1 && (
                  <span className="mx-1 text-lg text-[#FF6B00] md:mx-2">→</span>
                )}
                {i === cycle.length - 1 && (
                  <span className="mx-1 text-lg text-red-500 md:mx-2">↻</span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">이 고리를 끊지 않으면, 수원의 미래는 없습니다.</p>
        </div>

        {/* 클로징 슬로건 */}
        <div className="rounded-2xl border border-[#FF6B00]/30 bg-gradient-to-br from-[#FF6B00]/10 to-transparent p-8 text-center md:p-12">
          <h3 className="text-2xl font-extrabold text-white md:text-4xl">
            {closing?.title ?? "악순환을 끊겠습니다."}
          </h3>
          {closing?.body_html ? (
            <div
              className="mx-auto mt-4 max-w-xl text-sm text-gray-300 [&_*]:whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: closing.body_html }}
            />
          ) : (
            <p className="mx-auto mt-4 max-w-xl text-sm text-gray-300">
              정희윤이 만드는 수원 9.0 — 위기를 기회로 바꾸는 전환이 시작됩니다.
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
