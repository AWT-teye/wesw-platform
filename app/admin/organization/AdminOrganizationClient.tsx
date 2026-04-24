"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createOrgContact,
  deleteOrgContact,
  toggleOrgContactVisible,
  toggleOrgNodeVisible,
  updateOrgContact,
  updateOrgNode,
} from "./actions";

export type AdminOrgNode = {
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

export type AdminOrgContact = {
  id: string;
  org_node_key: string | null;
  department: string;
  phone: string | null;
  email: string | null;
  display_order: number;
  is_visible: boolean;
};

export default function AdminOrganizationClient({
  nodes,
  contacts,
}: {
  nodes: AdminOrgNode[];
  contacts: AdminOrgContact[];
}) {
  return (
    <div className="space-y-12">
      <NodesSection nodes={nodes} />
      <ContactsSection nodes={nodes} contacts={contacts} />

      <style>{`
        .input {
          display: block;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          background: #fff;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
        }
        .input:focus {
          border-color: #FF6B00;
          box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.15);
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// 섹션 1 — 조직 노드 편집
// ─────────────────────────────────────────────
function NodesSection({ nodes }: { nodes: AdminOrgNode[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    nodes[0]?.id ?? null
  );
  const selected = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId]
  );
  const [pending, startTransition] = useTransition();

  const onToggle = (id: string, next: boolean) => {
    startTransition(async () => {
      await toggleOrgNodeVisible(id, next);
    });
  };

  return (
    <section>
      <h2 className="text-xl font-extrabold">조직 노드</h2>
      <p className="mt-1 text-sm text-gray-500">
        행을 클릭하면 우측(또는 아래) 편집 패널에서 수정할 수 있습니다.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">이름(한글)</th>
                <th className="px-3 py-2">영문명</th>
                <th className="px-3 py-2">담당인물</th>
                <th className="px-3 py-2">역할</th>
                <th className="px-3 py-2">담당업무</th>
                <th className="px-3 py-2">노출</th>
              </tr>
            </thead>
            <tbody>
              {nodes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-xs text-gray-400"
                  >
                    등록된 조직 노드가 없습니다.
                  </td>
                </tr>
              )}
              {nodes.map((n) => {
                const isSelected = n.id === selectedId;
                return (
                  <tr
                    key={n.id}
                    onClick={() => setSelectedId(n.id)}
                    className={[
                      "cursor-pointer border-t border-gray-100",
                      isSelected
                        ? "bg-orange-50"
                        : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <td className="px-3 py-2 font-semibold">
                      {n.name_ko}
                    </td>
                    <td className="px-3 py-2 text-xs italic text-gray-500">
                      {n.name_en ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      {n.person_name ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      {n.role ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {n.description ?? "-"}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="inline-flex cursor-pointer items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={n.is_visible}
                          onChange={(e) => onToggle(n.id, e.target.checked)}
                          disabled={pending}
                        />
                        {n.is_visible ? "ON" : "OFF"}
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="sticky top-4 h-fit">
          {selected ? (
            <NodeEditorPanel key={selected.id} node={selected} />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-xs text-gray-400">
              좌측에서 노드를 선택하세요.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function NodeEditorPanel({ node }: { node: AdminOrgNode }) {
  const [form, setForm] = useState({
    name_ko: node.name_ko,
    name_en: node.name_en ?? "",
    person_name: node.person_name ?? "",
    role: node.role ?? "",
    description: node.description ?? "",
    is_visible: node.is_visible,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      const res = await updateOrgNode({
        id: node.id,
        name_ko: form.name_ko,
        name_en: form.name_en,
        person_name: form.person_name,
        role: form.role,
        description: form.description,
        is_visible: form.is_visible,
      });
      if ("error" in res && res.error) setErr(res.error);
      else setMsg("저장되었습니다.");
    });
  };

  return (
    <form
      onSubmit={onSave}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold">노드 편집</h3>
        <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-500">
          {node.node_key}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            이름(한글) *
          </span>
          <input
            type="text"
            required
            value={form.name_ko}
            onChange={(e) =>
              setForm((s) => ({ ...s, name_ko: e.target.value }))
            }
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            영문명
          </span>
          <input
            type="text"
            value={form.name_en}
            onChange={(e) =>
              setForm((s) => ({ ...s, name_en: e.target.value }))
            }
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            담당인물
          </span>
          <input
            type="text"
            value={form.person_name}
            onChange={(e) =>
              setForm((s) => ({ ...s, person_name: e.target.value }))
            }
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            역할
          </span>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            담당업무
          </span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((s) => ({ ...s, description: e.target.value }))
            }
            className="input"
          />
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_visible}
            onChange={(e) =>
              setForm((s) => ({ ...s, is_visible: e.target.checked }))
            }
          />
          노출 활성화
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:bg-[#e55f00] disabled:opacity-50"
        >
          저장
        </button>
        {msg && <span className="text-xs text-green-600">{msg}</span>}
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// 섹션 2 — 연락처 관리
// ─────────────────────────────────────────────
function ContactsSection({
  nodes,
  contacts,
}: {
  nodes: AdminOrgNode[];
  contacts: AdminOrgContact[];
}) {
  return (
    <section>
      <h2 className="text-xl font-extrabold">연락처 관리</h2>
      <p className="mt-1 text-sm text-gray-500">
        공개 페이지 하단에 카드 형태로 노출됩니다.
      </p>

      <ContactCreateForm nodes={nodes} />

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">부서명</th>
              <th className="px-3 py-2">조직 연결</th>
              <th className="px-3 py-2">전화</th>
              <th className="px-3 py-2">이메일</th>
              <th className="px-3 py-2">순서</th>
              <th className="px-3 py-2">노출</th>
              <th className="px-3 py-2 text-right">동작</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-xs text-gray-400"
                >
                  등록된 연락처가 없습니다.
                </td>
              </tr>
            )}
            {contacts.map((c) => (
              <ContactRow key={c.id} contact={c} nodes={nodes} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ContactCreateForm({ nodes }: { nodes: AdminOrgNode[] }) {
  const [department, setDepartment] = useState("");
  const [orgKey, setOrgKey] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setDepartment("");
    setOrgKey("");
    setPhone("");
    setEmail("");
    setDisplayOrder(0);
    setIsVisible(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      const res = await createOrgContact({
        department,
        org_node_key: orgKey || null,
        phone,
        email,
        display_order: Number(displayOrder) || 0,
        is_visible: isVisible,
      });
      if ("error" in res && res.error) {
        setErr(res.error);
      } else {
        setMsg("등록되었습니다.");
        reset();
      }
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h3 className="text-sm font-bold text-gray-900">연락처 추가</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            부서명 *
          </span>
          <input
            type="text"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input"
            placeholder="예: 서포터즈 · 자원봉사"
          />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            연결 조직
          </span>
          <select
            value={orgKey}
            onChange={(e) => setOrgKey(e.target.value)}
            className="input"
          >
            <option value="">(미지정)</option>
            {nodes.map((n) => (
              <option key={n.node_key} value={n.node_key}>
                {n.name_ko}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            순서
          </span>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="input"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-gray-700">
            노출
          </span>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
            />
            {isVisible ? "ON" : "OFF"}
          </label>
        </label>
        <label className="md:col-span-3">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            전화
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder="031-000-0000"
          />
        </label>
        <label className="md:col-span-3">
          <span className="mb-1 block text-xs font-bold text-gray-700">
            이메일
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="contact@wesw.kr"
          />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#FF6B00] px-5 py-2 text-sm font-bold text-white hover:bg-[#e55f00] disabled:opacity-50"
        >
          추가
        </button>
        {msg && <span className="text-xs text-green-600">{msg}</span>}
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>
    </form>
  );
}

function ContactRow({
  contact,
  nodes,
}: {
  contact: AdminOrgContact;
  nodes: AdminOrgNode[];
}) {
  const [form, setForm] = useState({
    department: contact.department,
    org_node_key: contact.org_node_key ?? "",
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    display_order: contact.display_order,
  });
  const [editing, setEditing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onToggle = (next: boolean) => {
    startTransition(async () => {
      const res = await toggleOrgContactVisible(contact.id, next);
      if ("error" in res && res.error) setErr(res.error);
    });
  };

  const onDelete = () => {
    if (!window.confirm("이 연락처를 삭제하시겠습니까?")) return;
    startTransition(async () => {
      const res = await deleteOrgContact(contact.id);
      if ("error" in res && res.error) setErr(res.error);
    });
  };

  const onSave = () => {
    setErr(null);
    startTransition(async () => {
      const res = await updateOrgContact({
        id: contact.id,
        department: form.department,
        org_node_key: form.org_node_key || null,
        phone: form.phone,
        email: form.email,
        display_order: Number(form.display_order) || 0,
        is_visible: contact.is_visible,
      });
      if ("error" in res && res.error) setErr(res.error);
      else setEditing(false);
    });
  };

  if (editing) {
    return (
      <tr className="border-t border-gray-100 bg-orange-50/40">
        <td className="px-3 py-2">
          <input
            type="text"
            value={form.department}
            onChange={(e) =>
              setForm((s) => ({ ...s, department: e.target.value }))
            }
            className="input"
          />
        </td>
        <td className="px-3 py-2">
          <select
            value={form.org_node_key}
            onChange={(e) =>
              setForm((s) => ({ ...s, org_node_key: e.target.value }))
            }
            className="input"
          >
            <option value="">(미지정)</option>
            {nodes.map((n) => (
              <option key={n.node_key} value={n.node_key}>
                {n.name_ko}
              </option>
            ))}
          </select>
        </td>
        <td className="px-3 py-2">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm((s) => ({ ...s, phone: e.target.value }))
            }
            className="input"
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((s) => ({ ...s, email: e.target.value }))
            }
            className="input"
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={form.display_order}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                display_order: Number(e.target.value),
              }))
            }
            className="input w-20"
          />
        </td>
        <td className="px-3 py-2 text-xs">
          {contact.is_visible ? "ON" : "OFF"}
        </td>
        <td className="whitespace-nowrap px-3 py-2 text-right text-xs">
          <button
            type="button"
            onClick={onSave}
            disabled={pending}
            className="mr-2 rounded bg-[#FF6B00] px-2 py-1 font-semibold text-white hover:bg-[#e55f00] disabled:opacity-50"
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded border border-gray-300 px-2 py-1 font-semibold text-gray-700 hover:bg-gray-100"
          >
            취소
          </button>
          {err && (
            <div className="mt-1 text-right text-[10px] text-red-600">
              {err}
            </div>
          )}
        </td>
      </tr>
    );
  }

  const linked = nodes.find((n) => n.node_key === contact.org_node_key);

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2 font-semibold">{contact.department}</td>
      <td className="px-3 py-2 text-xs text-gray-600">
        {linked?.name_ko ?? "-"}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-gray-700">
        {contact.phone ?? "-"}
      </td>
      <td className="px-3 py-2 text-xs text-gray-700">
        {contact.email ?? "-"}
      </td>
      <td className="px-3 py-2 text-xs text-gray-500">
        #{contact.display_order}
      </td>
      <td className="px-3 py-2">
        <label className="inline-flex cursor-pointer items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={contact.is_visible}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={pending}
          />
          {contact.is_visible ? "ON" : "OFF"}
        </label>
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right text-xs">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mr-2 rounded border border-gray-300 px-2 py-1 font-semibold text-gray-700 hover:bg-gray-100"
        >
          수정
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="rounded border border-red-300 px-2 py-1 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          삭제
        </button>
        {err && (
          <div className="mt-1 text-right text-[10px] text-red-600">
            {err}
          </div>
        )}
      </td>
    </tr>
  );
}
