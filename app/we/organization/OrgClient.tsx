"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type OrgNode = {
  id: string;
  node_key: string;
  name_ko: string;
  name_en: string | null;
  role: string | null;
  person_name: string | null;
  description: string | null;
  parent_key: string | null;
  level: number;
  display_order: number;
  color_scheme: string | null;
  is_visible: boolean;
};

export type OrgContact = {
  id: string;
  org_node_key: string | null;
  department: string;
  phone: string | null;
  email: string | null;
  display_order: number;
  is_visible: boolean;
};

type Props = {
  nodes: OrgNode[];
  contacts: OrgContact[];
};

type ViewMode = "chart" | "list" | "full";

const COLOR: Record<string, string> = {
  primary: "bg-[#FF6B00] text-white border-[#FF6B00]",
  red: "bg-red-50 text-red-900 border-red-200",
  green: "bg-green-50 text-green-900 border-green-200",
  legal: "bg-slate-100 text-slate-900 border-slate-300",
  advisory: "bg-indigo-50 text-indigo-900 border-indigo-200",
  staff: "bg-amber-50 text-amber-900 border-amber-200",
  team: "bg-white text-gray-800 border-gray-200",
  group1: "bg-blue-50 text-blue-900 border-blue-200",
  group2: "bg-purple-50 text-purple-900 border-purple-200",
  group3: "bg-orange-50 text-orange-900 border-orange-200",
  default: "bg-white text-gray-800 border-gray-200",
};

function colorClasses(scheme: string | null): string {
  return COLOR[scheme ?? "default"] ?? COLOR.default;
}

export default function OrgClient({ nodes, contacts }: Props) {
  // SSR 안전 기본값: list. 클라이언트 mount 후 PC면 full로 스위치.
  const [view, setView] = useState<ViewMode>("list");

  useEffect(() => {
    // 최초 mount: PC이면 전체 보기 기본
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setView("full");
    }
  }, []);

  useEffect(() => {
    // 뷰포트가 lg 미만으로 줄어들면 전체 보기는 차트 보기로 강제 전환
    if (typeof window === "undefined") return;
    const handler = () => {
      if (window.innerWidth < 1024) {
        setView((v) => (v === "full" ? "chart" : v));
      }
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // childrenMap: parent_key → children[] (already sorted by display_order via server)
  const { roots, childrenMap } = useMemo(() => {
    const map = new Map<string, OrgNode[]>();
    const rootList: OrgNode[] = [];
    for (const n of nodes) {
      if (!n.parent_key) {
        rootList.push(n);
      } else {
        const arr = map.get(n.parent_key) ?? [];
        arr.push(n);
        map.set(n.parent_key, arr);
      }
    }
    return { roots: rootList, childrenMap: map };
  }, [nodes]);

  const tabCls = (active: boolean) =>
    [
      "rounded-full px-4 py-1.5 text-sm font-bold transition",
      active
        ? "bg-[#FF6B00] text-white"
        : "border border-gray-300 bg-white text-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00]",
    ].join(" ");

  return (
    <>
      {/* [B] 뷰 토글 */}
      <div className="sticky top-14 z-10 mt-6 border-b border-gray-200 bg-gray-50/90 backdrop-blur md:top-16">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setView("chart")}
            className={tabCls(view === "chart")}
            aria-pressed={view === "chart"}
          >
            차트 보기
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={tabCls(view === "list")}
            aria-pressed={view === "list"}
          >
            목록 보기
          </button>
          <button
            type="button"
            onClick={() => setView("full")}
            className={`hidden lg:inline-flex ${tabCls(view === "full")}`}
            aria-pressed={view === "full"}
          >
            전체 보기
          </button>
        </div>
      </div>

      {/* [C-1] 차트 뷰 */}
      {view === "chart" && (
        <section className="mx-auto mt-6 max-w-6xl px-4">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mx-auto flex min-w-max justify-center">
              {roots.map((root) => (
                <OrgBranch
                  key={root.node_key}
                  node={root}
                  childrenMap={childrenMap}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-right text-xs text-gray-400">
            ← 가로로 스크롤하여 전체 조직을 확인하세요
          </p>
        </section>
      )}

      {/* [C-2] 목록 뷰 */}
      {view === "list" && (
        <section className="mx-auto mt-6 max-w-3xl px-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {roots.map((root) => (
              <OrgListItem
                key={root.node_key}
                node={root}
                childrenMap={childrenMap}
                depth={0}
              />
            ))}
          </div>
        </section>
      )}

      {/* [C-3] PC 전체 보기 */}
      {view === "full" && (
        <FullOrgChartPC nodes={nodes} />
      )}

      {/* [D] 연락처 */}
      <ContactsSection contacts={contacts} />
    </>
  );
}

// ─────────────────────────────────────────────
// 차트 뷰 — 재귀 브랜치
// ─────────────────────────────────────────────
function OrgBranch({
  node,
  childrenMap,
}: {
  node: OrgNode;
  childrenMap: Map<string, OrgNode[]>;
}) {
  const children = childrenMap.get(node.node_key) ?? [];
  const hasChildren = children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <OrgCard node={node} />
      {hasChildren && (
        <>
          {/* 부모 → 버스 수직선 */}
          <div className="h-4 w-px bg-[#FF6B00]/70" />
          {/* 수평 버스 (자식 2개 이상일 때만) */}
          {children.length > 1 && (
            <div className="h-px w-full bg-[#FF6B00]/40" />
          )}
          {/* 자식 행 */}
          <div className="flex items-start gap-4 md:gap-6">
            {children.map((c) => (
              <div
                key={c.node_key}
                className="flex flex-col items-center"
              >
                {/* 자식 위의 수직 스텁 */}
                <div className="h-4 w-px bg-[#FF6B00]/70" />
                <OrgBranch node={c} childrenMap={childrenMap} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OrgCard({ node }: { node: OrgNode }) {
  const cls = colorClasses(node.color_scheme);
  return (
    <div
      className={[
        "w-40 min-w-[160px] rounded-xl border-2 px-3 py-2 text-center shadow-sm md:w-44",
        cls,
      ].join(" ")}
    >
      <p className="text-sm font-extrabold leading-tight">{node.name_ko}</p>
      {node.name_en && (
        <p className="mt-0.5 text-[10px] italic opacity-70">{node.name_en}</p>
      )}
      {(node.role || node.person_name) && (
        <p className="mt-1 text-[11px] font-semibold">
          {node.role && <span>{node.role}</span>}
          {node.role && node.person_name && <span> · </span>}
          {node.person_name && <span>{node.person_name}</span>}
        </p>
      )}
      {node.description && (
        <p className="mt-1 text-[10px] leading-snug opacity-80">
          {node.description}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 목록 뷰 — 아코디언
// ─────────────────────────────────────────────
function OrgListItem({
  node,
  childrenMap,
  depth,
}: {
  node: OrgNode;
  childrenMap: Map<string, OrgNode[]>;
  depth: number;
}) {
  const children = childrenMap.get(node.node_key) ?? [];
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = children.length > 0;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => hasChildren && setOpen((v) => !v)}
        className={[
          "flex w-full items-start gap-3 px-4 py-3 text-left transition",
          hasChildren ? "hover:bg-gray-50" : "cursor-default",
        ].join(" ")}
        style={{ paddingLeft: 16 + depth * 20 }}
        aria-expanded={hasChildren ? open : undefined}
      >
        {hasChildren ? (
          <span
            aria-hidden
            className={[
              "mt-1 inline-block h-4 w-4 shrink-0 text-center text-xs font-bold text-[#FF6B00] transition-transform",
              open ? "rotate-90" : "",
            ].join(" ")}
          >
            ▶
          </span>
        ) : (
          <span
            aria-hidden
            className="mt-1 inline-block h-4 w-4 shrink-0 text-center text-xs text-gray-300"
          >
            •
          </span>
        )}
        <span className="flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-extrabold text-gray-900">
              {node.name_ko}
            </span>
            {node.name_en && (
              <span className="text-[11px] italic text-gray-400">
                {node.name_en}
              </span>
            )}
          </span>
          {(node.role || node.person_name) && (
            <span className="mt-0.5 block text-xs font-semibold text-[#FF6B00]">
              {node.role}
              {node.role && node.person_name ? " · " : ""}
              {node.person_name}
            </span>
          )}
          {node.description && (
            <span className="mt-1 block text-xs leading-relaxed text-gray-500">
              {node.description}
            </span>
          )}
        </span>
      </button>

      {open && hasChildren && (
        <div>
          {children.map((c) => (
            <OrgListItem
              key={c.node_key}
              node={c}
              childrenMap={childrenMap}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PC 전체 보기 — Top-Down 수직 트리 + 줌
// ─────────────────────────────────────────────
const LINE = "#E0E0E0";

function VLine({ h = 16 }: { h?: number }) {
  return (
    <div
      aria-hidden
      style={{ width: 1, height: h, backgroundColor: LINE }}
    />
  );
}

function FullCard({
  node,
  width,
  bg,
  textColor,
  borderColor,
}: {
  node: OrgNode;
  width: number;
  bg: string;
  textColor: string;
  borderColor: string;
}) {
  const hasRoleLine = !!(node.role || node.person_name);
  return (
    <div
      style={{
        width,
        padding: "8px 10px",
        backgroundColor: bg,
        color: textColor,
        borderRadius: 8,
        border: `1.5px solid ${borderColor}`,
        textAlign: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
        {node.name_ko}
      </div>
      {node.name_en && (
        <div style={{ fontSize: 9, marginTop: 2, opacity: 0.6 }}>
          {node.name_en}
        </div>
      )}
      {hasRoleLine && (
        <div
          style={{
            fontSize: 11,
            marginTop: 3,
            fontWeight: 600,
            color: textColor === "#fff" ? "#fff" : "#FF6B00",
          }}
        >
          {node.role}
          {node.role && node.person_name ? " · " : ""}
          {node.person_name}
        </div>
      )}
      {node.description && (
        <div
          style={{
            fontSize: 10,
            marginTop: 3,
            lineHeight: 1.3,
            color: textColor === "#fff" ? "rgba(255,255,255,0.85)" : "#6B7280",
          }}
        >
          {node.description}
        </div>
      )}
    </div>
  );
}

function TeamCard({ node }: { node: OrgNode }) {
  return (
    <div
      style={{
        width: 88,
        padding: "8px 10px",
        backgroundColor: "#fff",
        borderRadius: 8,
        border: "1.5px solid #E5E7EB",
        textAlign: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>
        {node.name_ko}
      </div>
      {node.description && (
        <div
          style={{
            fontSize: 10,
            marginTop: 3,
            lineHeight: 1.3,
            color: "#6B7280",
          }}
        >
          {node.description}
        </div>
      )}
    </div>
  );
}

// 위원회 개별 색상
function committeeColors(scheme: string | null): {
  bg: string;
  text: string;
  border: string;
} {
  switch (scheme) {
    case "green":
      return { bg: "#ECFDF5", text: "#064E3B", border: "#A7F3D0" };
    case "legal":
      return { bg: "#F1F5F9", text: "#0F172A", border: "#CBD5E1" };
    case "advisory":
      return { bg: "#EEF2FF", text: "#312E81", border: "#C7D2FE" };
    default:
      return { bg: "#F9FAFB", text: "#111827", border: "#E5E7EB" };
  }
}

function FullOrgChartPC({ nodes }: { nodes: OrgNode[] }) {
  const byKey = useMemo(() => {
    const m = new Map<string, OrgNode>();
    for (const n of nodes) m.set(n.node_key, n);
    return m;
  }, [nodes]);

  // auto-fit: 컨테이너 폭 / 뷰포트 높이에 맞춰 스케일을 계산
  // userScale 이 설정되면 사용자의 명시적 배율이 우선
  const [fitScale, setFitScale] = useState<number>(0.85);
  const [userScale, setUserScale] = useState<number | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const scale = userScale ?? fitScale;
  const isAutoFit = userScale === null;

  useLayoutEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      // scale=1일 때의 자연 크기를 측정
      const prev = content.style.transform;
      content.style.transform = "none";
      const nw = content.offsetWidth;
      const nh = content.offsetHeight;
      content.style.transform = prev;

      setNaturalSize({ w: nw, h: nh });

      const cw = container.clientWidth;
      const maxH = Math.max(420, window.innerHeight * 0.82);
      const sx = nw > 0 ? cw / nw : 1;
      const sy = nh > 0 ? maxH / nh : 1;
      const s = Math.min(sx, sy, 1);
      setFitScale(Math.max(0.3, +s.toFixed(3)));
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [nodes]);

  const getN = (k: string): OrgNode | undefined => byKey.get(k);

  const chair = getN("chair");
  const sec = getN("secretary_general");
  const committees = (
    ["finance", "audit", "legal", "advisory"]
      .map(getN)
      .filter(Boolean) as OrgNode[]
  );
  const pl = getN("party_liaison");
  const staff = getN("staff_special");
  const staffTeams = (
    ["debate_tf", "observers", "visual"]
      .map(getN)
      .filter(Boolean) as OrgNode[]
  );
  const g1 = getN("group1");
  const g2 = getN("group2");
  const g3 = getN("group3");
  const g1Teams = (
    ["policy_dev", "policy_research", "policy_verify", "data_mgmt", "analysis"]
      .map(getN)
      .filter(Boolean) as OrgNode[]
  );
  const g2Teams = (
    ["sns_team", "youtube_team", "press_team", "crisis_team", "canvass_team"]
      .map(getN)
      .filter(Boolean) as OrgNode[]
  );
  const g3Teams = (
    ["supporters", "field_ops", "volunteer"]
      .map(getN)
      .filter(Boolean) as OrgNode[]
  );

  if (!chair || !sec) return null;

  const zoomIn = () =>
    setUserScale((s) =>
      Math.min(1.5, +(((s ?? fitScale) + 0.1)).toFixed(2))
    );
  const zoomOut = () =>
    setUserScale((s) =>
      Math.max(0.3, +(((s ?? fitScale) - 0.1)).toFixed(2))
    );
  const zoomReset = () => setUserScale(null); // 자동 맞춤으로 복귀

  // 측정이 완료된 상태에서만 wrapper 크기를 적용
  const measured = naturalSize.w > 0 && naturalSize.h > 0;
  const wrapperW = measured ? naturalSize.w * scale : undefined;
  const wrapperH = measured ? naturalSize.h * scale : undefined;

  // 사용자가 자동맞춤보다 크게 확대 → 가로 스크롤 허용
  const allowScrollX = !isAutoFit && scale > fitScale + 0.001;

  return (
    <section className="mx-auto mt-6 max-w-6xl px-4">
      <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* 줌 컨트롤 */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            className="zbtn"
            aria-label="축소"
          >
            −
          </button>
          <span className="inline-flex w-20 select-none items-center justify-center gap-1 text-center text-xs font-semibold text-gray-500">
            {Math.round(scale * 100)}%
            {isAutoFit && (
              <span className="text-[9px] font-bold text-[#FF6B00]">AUTO</span>
            )}
          </span>
          <button
            type="button"
            onClick={zoomIn}
            className="zbtn"
            aria-label="확대"
          >
            +
          </button>
          <button
            type="button"
            onClick={zoomReset}
            className="zbtn-text"
            aria-label="자동 맞춤으로 복귀"
          >
            자동맞춤
          </button>
        </div>

        <div
          ref={containerRef}
          className="px-6 pb-6 pt-14"
          style={{
            overflowX: allowScrollX ? "auto" : "hidden",
            overflowY: "hidden",
          }}
        >
          <div
            className="mx-auto"
            style={{
              width: wrapperW ? `${wrapperW}px` : undefined,
              height: wrapperH ? `${wrapperH}px` : undefined,
              position: "relative",
            }}
          >
            <div
              ref={contentRef}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: "max-content",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <div className="flex flex-col items-center">
                {/* Row 1 — 총괄선거대책위원장 */}
                <FullCard
                  node={chair}
                  width={220}
                  bg="#FF6B00"
                  textColor="#fff"
                  borderColor="#FF6B00"
                />

                {/* 위원장 → 버스 → 위원회 + 중앙 트렁크 */}
                <VLine h={20} />
                <CommitteesSection committees={committees} />

                {/* 트렁크 → 사무국장 */}
                <VLine h={20} />

                {/* Row 2 — 사무국장 */}
                <FullCard
                  node={sec}
                  width={220}
                  bg="#FEE2E2"
                  textColor="#7F1D1D"
                  borderColor="#FCA5A5"
                />

                <VLine h={24} />

                {/* Row 3 — 스태프 라인 (PL + Staff + staff teams) + 중앙 트렁크 */}
                <StaffSection
                  pl={pl}
                  staff={staff}
                  staffTeams={staffTeams}
                />

                {/* Row 4 — 3그룹 */}
                <GroupsSection
                  g1={g1}
                  g2={g2}
                  g3={g3}
                  g1Teams={g1Teams}
                  g2Teams={g2Teams}
                  g3Teams={g3Teams}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-right text-xs text-gray-400">
        {isAutoFit
          ? "화면 크기에 맞춰 자동 축소됩니다. +/- 로 배율을 조절하세요."
          : "‘자동맞춤’을 누르면 한 화면에 맞춰 다시 배율이 조정됩니다."}
      </p>

      <style>{`
        .zbtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          border: 1px solid #d1d5db;
          background: #fff;
          font-size: 16px;
          font-weight: 700;
          color: #374151;
          line-height: 1;
        }
        .zbtn:hover { background: #f3f4f6; color: #FF6B00; border-color: #FF6B00; }
        .zbtn-text {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          height: 32px;
          border-radius: 9999px;
          border: 1px solid #d1d5db;
          background: #fff;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          margin-left: 4px;
        }
        .zbtn-text:hover { background: #f3f4f6; color: #FF6B00; border-color: #FF6B00; }
      `}</style>
    </section>
  );
}

function CommitteesSection({ committees }: { committees: OrgNode[] }) {
  // 720px 폭: justify-between으로 4장 배치 → 중앙에 공간 확보(Sec Gen 트렁크용)
  return (
    <div className="relative" style={{ width: 720 }}>
      {/* 수평 버스 — 4장의 카드 중심선 구간 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 55,
          right: 55,
          height: 1,
          background: LINE,
        }}
      />
      {/* 중앙 수직 트렁크 (위원장 → 사무국장) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: 1,
          background: LINE,
          transform: "translateX(-0.5px)",
        }}
      />
      <div className="flex justify-between" style={{ gap: 0 }}>
        {committees.map((c) => {
          const { bg, text, border } = committeeColors(c.color_scheme);
          return (
            <div
              key={c.node_key}
              className="relative flex flex-col items-center"
            >
              <VLine h={20} />
              <FullCard
                node={c}
                width={110}
                bg={bg}
                textColor={text}
                borderColor={border}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StaffSection({
  pl,
  staff,
  staffTeams,
}: {
  pl?: OrgNode;
  staff?: OrgNode;
  staffTeams: OrgNode[];
}) {
  return (
    <div className="relative w-full">
      {/* 스태프 수평 버스 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "30%",
          right: "30%",
          height: 1,
          background: LINE,
        }}
      />
      {/* 중앙 트렁크 (사무국장 → Row 4 그룹) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: 1,
          background: LINE,
          transform: "translateX(-0.5px)",
        }}
      />
      <div
        className="flex items-start justify-center"
        style={{ gap: 140 }}
      >
        {pl && (
          <div className="flex flex-col items-center">
            <VLine h={20} />
            <FullCard
              node={pl}
              width={120}
              bg="#FEF3C7"
              textColor="#78350F"
              borderColor="#FCD34D"
            />
          </div>
        )}
        {staff && (
          <div className="flex flex-col items-center">
            <VLine h={20} />
            <FullCard
              node={staff}
              width={120}
              bg="#FEF3C7"
              textColor="#78350F"
              borderColor="#FCD34D"
            />
            {staffTeams.length > 0 && (
              <>
                <VLine h={16} />
                <div className="relative flex items-start gap-2">
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 44,
                      right: 44,
                      height: 1,
                      background: LINE,
                    }}
                  />
                  {staffTeams.map((t) => (
                    <div
                      key={t.node_key}
                      className="flex flex-col items-center"
                    >
                      <VLine h={16} />
                      <TeamCard node={t} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {/* 하단 여백 — Row 4로 내려가는 트렁크 공간 */}
      <div style={{ height: 28 }} />
    </div>
  );
}

function GroupsSection({
  g1,
  g2,
  g3,
  g1Teams,
  g2Teams,
  g3Teams,
}: {
  g1?: OrgNode;
  g2?: OrgNode;
  g3?: OrgNode;
  g1Teams: OrgNode[];
  g2Teams: OrgNode[];
  g3Teams: OrgNode[];
}) {
  const groups: Array<{
    node?: OrgNode;
    teams: OrgNode[];
    bg: string;
    text: string;
    border: string;
  }> = [
    {
      node: g1,
      teams: g1Teams,
      bg: "#EEF2FF",
      text: "#1E3A8A",
      border: "#C7D2FE",
    },
    {
      node: g2,
      teams: g2Teams,
      bg: "#F5F0FF",
      text: "#5B21B6",
      border: "#DDD6FE",
    },
    {
      node: g3,
      teams: g3Teams,
      bg: "#FFF4EE",
      text: "#9A3412",
      border: "#FED7AA",
    },
  ];

  return (
    <div className="relative w-full">
      {/* 그룹 수평 버스 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: 1,
          background: LINE,
        }}
      />
      <div
        className="flex items-start justify-around"
        style={{ paddingTop: 0 }}
      >
        {groups.map(({ node, teams, bg, text, border }, idx) => {
          if (!node) return null;
          return (
            <div
              key={node.node_key ?? `g-${idx}`}
              className="flex flex-col items-center"
            >
              <VLine h={20} />
              <FullCard
                node={node}
                width={160}
                bg={bg}
                textColor={text}
                borderColor={border}
              />
              {teams.length > 0 && (
                <>
                  <VLine h={16} />
                  <div className="relative flex items-start gap-2">
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 44,
                        right: 44,
                        height: 1,
                        background: LINE,
                      }}
                    />
                    {teams.map((t) => (
                      <div
                        key={t.node_key}
                        className="flex flex-col items-center"
                      >
                        <VLine h={16} />
                        <TeamCard node={t} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 연락처
// ─────────────────────────────────────────────
function ContactsSection({ contacts }: { contacts: OrgContact[] }) {
  if (contacts.length === 0) return null;
  return (
    <section className="mx-auto mt-10 max-w-6xl px-4">
      <h2 className="mb-4 text-lg font-extrabold md:text-xl">📞 연락처</h2>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border-l-4 border-[#FF6B00] bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-extrabold text-gray-900">
              {c.department}
            </p>
            {c.phone && (
              <p className="mt-2 text-sm">
                <a
                  href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex items-center gap-1 text-gray-700 hover:text-[#FF6B00] hover:underline"
                >
                  <span aria-hidden>📞</span>
                  {c.phone}
                </a>
              </p>
            )}
            {c.email && (
              <p className="mt-1 text-sm">
                <a
                  href={`mailto:${c.email}`}
                  className="inline-flex items-center gap-1 break-all text-gray-700 hover:text-[#FF6B00] hover:underline"
                >
                  <span aria-hidden>✉️</span>
                  {c.email}
                </a>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
