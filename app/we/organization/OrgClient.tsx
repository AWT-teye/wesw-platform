"use client";

import { useMemo, useState } from "react";

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

type ViewMode = "chart" | "list";

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
  const [view, setView] = useState<ViewMode>("chart");

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

  return (
    <>
      {/* [B] 뷰 토글 */}
      <div className="sticky top-14 z-10 mt-6 border-b border-gray-200 bg-gray-50/90 backdrop-blur md:top-16">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setView("chart")}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-bold transition",
              view === "chart"
                ? "bg-[#FF6B00] text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00]",
            ].join(" ")}
            aria-pressed={view === "chart"}
          >
            차트 보기
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-bold transition",
              view === "list"
                ? "bg-[#FF6B00] text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00]",
            ].join(" ")}
            aria-pressed={view === "list"}
          >
            목록 보기
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
