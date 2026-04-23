"use client";

import { useState, useTransition } from "react";
import {
  addStatement,
  deleteStatement,
  toggleStatementVisibility,
} from "./actions";

type Statement = {
  id: string;
  content: string;
  source: string | null;
  stated_at: string | null;
  is_visible: boolean;
  display_order: number;
};

export default function StatementsSection({
  statements,
}: {
  statements: Statement[];
}) {
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [statedAt, setStatedAt] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setMsg("발언 내용은 필수입니다.");
      return;
    }
    setMsg("");
    startTransition(async () => {
      const r = await addStatement({
        content: content.trim(),
        source: source.trim() || undefined,
        stated_at: statedAt || undefined,
      });
      if ("error" in r && r.error) {
        setMsg(`오류: ${r.error}`);
      } else {
        setContent("");
        setSource("");
        setStatedAt("");
      }
    });
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold">최근 발언</h2>

      <form onSubmit={onAdd} className="mb-6 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="발언 내용"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="출처 (예: 2026 지방선거 TV토론)"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={statedAt}
            onChange={(e) => setStatedAt(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "추가 중..." : "추가"}
          </button>
        </div>
      </form>

      {msg && <p className="mb-4 rounded border border-gray-200 bg-gray-50 p-2 text-xs">{msg}</p>}

      {statements.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          등록된 발언이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {statements.map((s) => (
            <StatementRow key={s.id} statement={s} />
          ))}
        </ul>
      )}
    </section>
  );
}

function StatementRow({ statement }: { statement: Statement }) {
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<unknown>) {
    startTransition(async () => {
      await fn();
    });
  }

  return (
    <li className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm text-gray-800">{statement.content}</p>
        <p className="mt-1 text-xs text-gray-500">
          {statement.source ? statement.source : "출처 없음"}
          {statement.stated_at ? ` · ${statement.stated_at}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Toggle
          value={statement.is_visible}
          disabled={pending}
          onChange={(v) => run(() => toggleStatementVisibility(statement.id, v))}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("이 발언을 삭제할까요?")) run(() => deleteStatement(statement.id));
          }}
          className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          삭제
        </button>
      </div>
    </li>
  );
}

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        value ? "bg-[#FF6B00]" : "bg-gray-300"
      } disabled:opacity-40`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          value ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}
